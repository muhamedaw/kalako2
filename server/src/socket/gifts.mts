import crypto from 'node:crypto'
import type { Server, Socket } from 'socket.io'
import { config } from '../config.mts'
import { getDb, persistToDisk } from '../db/index.mts'
import { ensureProfileRow } from './economy.mts'
import { isRateLimited } from './rateLimit.mts'
import { asObject, asString } from './validate.mts'
import { safeOn } from './wrapHandler.mts'

// One-time PayPal item — NOT a recurring subscription. Hardcoded server-side truth, same
// pattern as payments.mts's COIN_TIERS: a client's claimed amount is never trusted.
const GIFT_PREMIUM_USD = 4.99
const GIFT_CODE_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function paypalBaseUrl(): string {
  return config.paypalMode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'
}

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) return cachedToken.token
  if (!config.paypalClientId || !config.paypalClientSecret) {
    throw new Error('PayPal credentials not configured (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET)')
  }

  const basicAuth = Buffer.from(`${config.paypalClientId}:${config.paypalClientSecret}`).toString('base64')
  const res = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) throw new Error(`PayPal OAuth failed: HTTP ${res.status}`)
  const data = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 }
  return cachedToken.token
}

async function createGiftPremiumOrder(): Promise<string> {
  const token = await getAccessToken()
  const res = await fetch(`${paypalBaseUrl()}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{ amount: { currency_code: 'USD', value: GIFT_PREMIUM_USD.toFixed(2) } }],
    }),
  })
  const data = (await res.json().catch(() => ({}))) as { id?: string }
  if (!res.ok || !data.id) throw new Error(`PayPal order create failed: HTTP ${res.status}`)
  return data.id
}

async function capturePaypalOrderRemote(paypalOrderId: string): Promise<{ completed: boolean }> {
  const token = await getAccessToken()
  const res = await fetch(`${paypalBaseUrl()}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })
  const data = (await res.json().catch(() => ({}))) as { status?: string }
  return { completed: res.ok && data.status === 'COMPLETED' }
}

function randomGiftCode(): string {
  let code = ''
  for (let i = 0; i < 8; i++) code += GIFT_CODE_CHARSET[crypto.randomInt(GIFT_CODE_CHARSET.length)]
  return code
}

function generateUniqueGiftCode(): string {
  const db = getDb()
  for (let attempt = 0; attempt < 20; attempt++) {
    const code = randomGiftCode()
    const existing = db.exec(`SELECT 1 FROM gift_codes WHERE code = ?`, [code])
    if (existing.length === 0 || existing[0].values.length === 0) return code
  }
  throw new Error('Failed to generate a unique gift code after 20 attempts')
}

export function registerGiftHandlers(io: Server, socket: Socket) {
  safeOn(socket, 'create_gift_premium_order', async (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = asObject<{ deviceId?: string }>(_payload)
    const deviceId = asString(payload.deviceId)
    if (!deviceId) return ack?.({ error: 'deviceId required' })
    if (isRateLimited(`create_gift_premium_order:${deviceId}`, 5, 60_000)) return ack?.({ error: 'rate_limited' })
    if (!config.paypalClientId || !config.paypalClientSecret) return ack?.({ error: 'paypal_not_configured' })

    try {
      const orderId = await createGiftPremiumOrder()
      ack?.({ orderId })
    } catch (err) {
      console.error('[kalak] create_gift_premium_order failed:', err)
      ack?.({ error: 'order_create_failed' })
    }
  })

  safeOn(socket, 'capture_gift_premium_order', async (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = asObject<{ deviceId?: string; paypalOrderId?: string }>(_payload)
    const deviceId = asString(payload.deviceId)
    const paypalOrderId = asString(payload.paypalOrderId)
    if (!deviceId || !paypalOrderId) return ack?.({ success: false, error: 'deviceId and paypalOrderId required' })
    if (isRateLimited(`capture_gift_premium_order:${deviceId}`, 10, 60_000)) return ack?.({ success: false, error: 'rate_limited' })

    ensureProfileRow(deviceId, 'Player')
    const db = getDb()

    // Idempotency: reuse the transactions(paypal_order_id UNIQUE) guard the coin-pack flow
    // uses (payments.mts) — coins_credited=0 here since this purchase grants a gift code,
    // not coins. Avoids adding a new column to the "final" gift_codes schema just for this.
    const existing = db.exec(`SELECT 1 FROM transactions WHERE paypal_order_id = ?`, [paypalOrderId])
    if (existing.length > 0 && existing[0].values.length > 0) {
      const codeRow = db.exec(
        `SELECT code FROM gift_codes WHERE purchased_by_device = ? ORDER BY rowid DESC LIMIT 1`,
        [deviceId]
      )
      return ack?.({
        success: true,
        alreadyProcessed: true,
        code: codeRow.length > 0 && codeRow[0].values.length > 0 ? codeRow[0].values[0][0] : undefined,
      })
    }

    try {
      const { completed } = await capturePaypalOrderRemote(paypalOrderId)
      if (!completed) return ack?.({ success: false, error: 'payment_not_completed' })

      try {
        db.run(
          `INSERT INTO transactions (device_id, paypal_order_id, tier, amount_usd, coins_credited, status) VALUES (?, ?, 'gift_premium_month', ?, 0, 'COMPLETED')`,
          [deviceId, paypalOrderId, GIFT_PREMIUM_USD]
        )
      } catch {
        // UNIQUE(paypal_order_id) tripped — a concurrent request already captured this order.
        return ack?.({ success: false, error: 'already_processed_concurrently' })
      }

      const code = generateUniqueGiftCode()
      db.run(
        `INSERT INTO gift_codes (code, type, item_id, purchased_by_device) VALUES (?, 'premium_month', 'premium_month', ?)`,
        [code, deviceId]
      )
      persistToDisk()

      ack?.({ success: true, code })
    } catch (err) {
      console.error('[kalak] capture_gift_premium_order failed:', err)
      ack?.({ success: false, error: 'capture_failed' })
    }
  })

  safeOn(socket, 'redeem_gift_code', (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = asObject<{ deviceId?: string; code?: string }>(_payload)
    const deviceId = asString(payload.deviceId)
    const code = (asString(payload.code) || '').trim().toUpperCase()
    if (!deviceId || !code) return ack?.({ success: false, error: 'deviceId and code are required' })
    // Tighter than most handlers here on purpose: this is a code-guessing attack surface (8
    // chars, 32-char alphabet — large but not infinite). 5/hour/device caps brute-force
    // throughput hard even though deviceId itself is client-supplied and can be rotated.
    if (isRateLimited(`redeem_gift_code:${deviceId}`, 5, 3_600_000)) return ack?.({ success: false, error: 'rate_limited' })

    ensureProfileRow(deviceId, 'Player')
    const db = getDb()

    try {
      const rows = db.exec(`SELECT type, redeemed_by_device FROM gift_codes WHERE code = ?`, [code])
      if (rows.length === 0 || rows[0].values.length === 0) return ack?.({ success: false, error: 'invalid_code' })
      const [type, redeemedBy] = rows[0].values[0] as [string, string | null]
      if (redeemedBy) return ack?.({ success: false, error: 'already_redeemed' })

      if (type === 'premium_month') {
        const subRows = db.exec(
          `SELECT expires_at FROM premium_subscriptions WHERE device_id = ? AND status = 'active' ORDER BY expires_at DESC LIMIT 1`,
          [deviceId]
        )
        const currentExpiresAt = subRows.length > 0 && subRows[0].values.length > 0 ? (subRows[0].values[0][0] as string | null) : null
        const base = currentExpiresAt && new Date(currentExpiresAt) > new Date() ? new Date(currentExpiresAt) : new Date()
        base.setMonth(base.getMonth() + 1)
        const newExpiresAt = base.toISOString()
        // Synthetic subscription id — this grant has no real PayPal subscription behind it,
        // but premium_subscriptions' PK is (device_id, subscription_id) so it still needs one.
        const syntheticSubscriptionId = `gift_${code}`

        db.run(
          `INSERT OR REPLACE INTO premium_subscriptions (device_id, subscription_id, plan_id, status, expires_at, updated_at) VALUES (?, ?, 'gift', 'active', ?, datetime('now'))`,
          [deviceId, syntheticSubscriptionId, newExpiresAt]
        )
        db.run(`UPDATE gift_codes SET redeemed_by_device = ?, redeemed_at = datetime('now') WHERE code = ?`, [deviceId, code])
        db.run(`INSERT INTO notifications (device_id, type, payload_json) VALUES (?, 'gift_redeemed', ?)`, [
          deviceId,
          JSON.stringify({ type: 'premium_month', expiresAt: newExpiresAt }),
        ])
        persistToDisk()
        return ack?.({ success: true, itemGranted: 'premium_month', expiresAt: newExpiresAt })
      }

      return ack?.({ success: false, error: 'unknown_gift_type' })
    } catch (err) {
      console.error('[kalak] redeem_gift_code failed:', err)
      ack?.({ success: false, error: 'redeem_failed' })
    }
  })
}
