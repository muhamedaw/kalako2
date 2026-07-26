import type { Server, Socket } from 'socket.io'
import { config } from '../config.mts'
import { getDb, persistToDisk } from '../db/index.mts'
import { ensureProfileRow } from './economy.mts'
import { isRateLimited } from './rateLimit.mts'
import { asString } from './validate.mts'
import { safeOn } from './wrapHandler.mts'

interface CoinTier {
  amountUsd: number
  coins: number
}

// Hardcoded server-side truth — a client's claimed price/coin amount is never trusted.
export const COIN_TIERS: Record<string, CoinTier> = {
  tier_small: { amountUsd: 1.99, coins: 100 },
  tier_medium: { amountUsd: 4.99, coins: 300 },
  tier_large: { amountUsd: 9.99, coins: 700 },
}

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

async function createPaypalOrder(tierId: string): Promise<string> {
  const tier = COIN_TIERS[tierId]
  const token = await getAccessToken()
  const res = await fetch(`${paypalBaseUrl()}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{ amount: { currency_code: 'USD', value: tier.amountUsd.toFixed(2) } }],
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

function currentCoins(deviceId: string): number {
  const db = getDb()
  const row = db.exec(`SELECT coins FROM players WHERE device_id = ?`, [deviceId])
  return row.length > 0 && row[0].values.length > 0 ? Number(row[0].values[0][0]) : 0
}

type CaptureResult =
  | { success: true; newCoinBalance: number; alreadyProcessed?: true }
  | { success: false; reason: string }

export async function capturePaypalOrder(
  deviceId: string,
  paypalOrderId: string,
  tierId: string
): Promise<CaptureResult> {
  const tier = COIN_TIERS[tierId]
  if (!tier) return { success: false, reason: 'invalid_tier' }

  ensureProfileRow(deviceId, 'Player')
  const db = getDb()

  // Idempotency guard: if this PayPal order was already captured & credited, never re-credit —
  // just return the current balance. Checked before touching PayPal so retries are cheap and safe.
  const existing = db.exec(`SELECT 1 FROM transactions WHERE paypal_order_id = ?`, [paypalOrderId])
  if (existing.length > 0 && existing[0].values.length > 0) {
    return { success: true, newCoinBalance: currentCoins(deviceId), alreadyProcessed: true }
  }

  const { completed } = await capturePaypalOrderRemote(paypalOrderId)
  if (!completed) return { success: false, reason: 'payment_not_completed' }

  try {
    db.run(
      `INSERT INTO transactions (device_id, paypal_order_id, tier, amount_usd, coins_credited, status)
       VALUES (?, ?, ?, ?, ?, 'COMPLETED')`,
      [deviceId, paypalOrderId, tierId, tier.amountUsd, tier.coins]
    )
  } catch {
    // UNIQUE(paypal_order_id) tripped — a concurrent request already inserted this order.
    return { success: true, newCoinBalance: currentCoins(deviceId), alreadyProcessed: true }
  }

  db.run(`UPDATE players SET coins = coins + ? WHERE device_id = ?`, [tier.coins, deviceId])
  db.run(`INSERT INTO notifications (device_id, type, payload_json) VALUES (?, 'coins_purchased', ?)`, [
    deviceId,
    JSON.stringify({ amount: tier.coins, tier: tierId }),
  ])
  persistToDisk()

  return { success: true, newCoinBalance: currentCoins(deviceId) }
}

export function registerPaymentHandlers(io: Server, socket: Socket) {
  safeOn(socket, 'create_paypal_order', async (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = _payload as { deviceId?: string; tierId?: string } | undefined
    const deviceId = asString(payload?.deviceId)
    const tierId = asString(payload?.tierId)
    if (!deviceId || !tierId) return ack?.({ error: 'deviceId and tierId required' })
    if (isRateLimited(`create_paypal_order:${deviceId}`, 5, 60_000)) return ack?.({ error: 'rate_limited' })
    if (!COIN_TIERS[tierId]) return ack?.({ error: 'invalid_tier' })
    if (!config.paypalClientId || !config.paypalClientSecret) {
      return ack?.({ error: 'paypal_not_configured' })
    }

    try {
      const orderId = await createPaypalOrder(tierId)
      ack?.({ orderId })
    } catch (err) {
      console.error('[kalak] create_paypal_order failed:', err)
      ack?.({ error: 'order_create_failed' })
    }
  })

  safeOn(socket, 'capture_paypal_order', async (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = _payload as { deviceId?: string; paypalOrderId?: string; tierId?: string } | undefined
    const deviceId = asString(payload?.deviceId)
    const paypalOrderId = asString(payload?.paypalOrderId)
    const tierId = asString(payload?.tierId)
    if (!deviceId || !paypalOrderId || !tierId) {
      return ack?.({ success: false, reason: 'deviceId, paypalOrderId and tierId required' })
    }
    if (isRateLimited(`capture_paypal_order:${deviceId}`, 10, 60_000)) {
      return ack?.({ success: false, reason: 'rate_limited' })
    }

    try {
      const result = await capturePaypalOrder(deviceId, paypalOrderId, tierId)
      ack?.(result)
    } catch (err) {
      console.error('[kalak] capture_paypal_order failed:', err)
      ack?.({ success: false, reason: 'capture_failed' })
    }
  })
}
