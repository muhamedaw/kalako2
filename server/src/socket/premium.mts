import type { Server, Socket } from 'socket.io'
import { config } from '../config.mts'
import { getDb, persistToDisk } from '../db/index.mts'
import { isRateLimited } from './rateLimit.mts'
import { asString } from './validate.mts'
import { safeOn } from './wrapHandler.mts'

async function getPayPalAccessToken(): Promise<string> {
  const base = config.paypalMode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.paypalClientId}:${config.paypalClientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`PayPal token error ${res.status}: ${body}`)
  }
  const data = await res.json()
  return data.access_token
}

function paypalApiBase(): string {
  return config.paypalMode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'
}

function checkPremium(deviceId: string | null): boolean {
  if (!deviceId) return false
  const db = getDb()
  const rows = db.exec(
    `SELECT 1 FROM premium_subscriptions WHERE device_id = ? AND status = 'active'`,
    [deviceId]
  )
  return rows.length > 0 && rows[0].values.length > 0
}

export function registerPremiumHandlers(io: Server, socket: Socket) {
  safeOn(socket, 'create_premium_subscription', async (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = _payload as { deviceId?: string } | undefined
    const deviceId = asString(payload?.deviceId)
    if (!deviceId) return ack?.({ success: false, error: 'deviceId required' })
    if (isRateLimited(`create_premium_subscription:${deviceId}`, 3, 60_000)) return ack?.({ success: false, error: 'rate_limited' })

    // If already active, don't create a new subscription
    if (checkPremium(deviceId)) return ack?.({ success: false, error: 'already_premium' })

    try {
      const token = await getPayPalAccessToken()
      const res = await fetch(`${paypalApiBase()}/v1/billing/subscriptions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': `premium-${deviceId}-${Date.now()}`,
        },
        body: JSON.stringify({
          plan_id: config.paypalPremiumPlanId,
          start_time: new Date(Date.now() + 60_000).toISOString(),
          subscriber: { name: { given_name: 'Kalako', surname: 'Player' } },
          application_context: {
            brand_name: 'Kalako',
            locale: 'en-US',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'SUBSCRIBE_NOW',
            return_url: config.paypalReturnUrl,
            cancel_url: config.paypalCancelUrl,
          },
        }),
      })

      if (!res.ok) {
        const body = await res.text().catch(() => '')
        console.error('[kalak] PayPal create subscription failed:', res.status, body)
        return ack?.({ success: false, error: 'paypal_create_failed' })
      }

      const data = await res.json()
      const subscriptionId = data.id as string
      const approvalLink = (data.links as Array<{ rel: string; href: string }>).find((l) => l.rel === 'approve')?.href

      if (!subscriptionId || !approvalLink) {
        return ack?.({ success: false, error: 'paypal_invalid_response' })
      }

      // Store pending subscription
      const db = getDb()
      db.run(
        `INSERT OR REPLACE INTO premium_subscriptions (device_id, subscription_id, plan_id, status, updated_at) VALUES (?, ?, ?, 'pending', datetime('now'))`,
        [deviceId, subscriptionId, config.paypalPremiumPlanId]
      )
      persistToDisk()

      ack?.({ success: true, approvalUrl: approvalLink, subscriptionId })
    } catch (err) {
      console.error('[kalak] create_premium_subscription failed:', err)
      ack?.({ success: false, error: 'create_premium_failed' })
    }
  })

  safeOn(socket, 'activate_premium_subscription', async (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = _payload as { deviceId?: string; subscriptionId?: string } | undefined
    const deviceId = asString(payload?.deviceId)
    const subscriptionId = asString(payload?.subscriptionId)
    if (!deviceId || !subscriptionId) return ack?.({ success: false, error: 'deviceId and subscriptionId required' })
    if (isRateLimited(`activate_premium_subscription:${deviceId}`, 10, 60_000)) return ack?.({ success: false, error: 'rate_limited' })

    try {
      const token = await getPayPalAccessToken()
      const res = await fetch(`${paypalApiBase()}/v1/billing/subscriptions/${subscriptionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const body = await res.text().catch(() => '')
        console.error('[kalak] PayPal get subscription failed:', res.status, body)
        return ack?.({ success: false, error: 'paypal_verify_failed' })
      }

      const data = await res.json()
      const status = data.status as string

      if (status !== 'ACTIVE') {
        // PayPal may return APPROVAL_PENDING if user hasn't completed approval yet
        return ack?.({ success: false, error: 'subscription_not_active', status })
      }

      const db = getDb()
      db.run(
        `UPDATE premium_subscriptions SET status = 'active', updated_at = datetime('now') WHERE subscription_id = ?`,
        [subscriptionId]
      )
      persistToDisk()

      ack?.({ success: true, isPremium: true })
    } catch (err) {
      console.error('[kalak] activate_premium_subscription failed:', err)
      ack?.({ success: false, error: 'activate_premium_failed' })
    }
  })

  safeOn(socket, 'cancel_premium_subscription', async (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = _payload as { deviceId?: string } | undefined
    const deviceId = asString(payload?.deviceId)
    if (!deviceId) return ack?.({ success: false, error: 'deviceId required' })
    if (isRateLimited(`cancel_premium_subscription:${deviceId}`, 3, 60_000)) return ack?.({ success: false, error: 'rate_limited' })

    try {
      const db = getDb()
      const rows = db.exec(
        `SELECT subscription_id FROM premium_subscriptions WHERE device_id = ? AND status = 'active'`,
        [deviceId]
      )
      if (rows.length === 0 || rows[0].values.length === 0) return ack?.({ success: false, error: 'no_active_subscription' })

      const subscriptionId = rows[0].values[0][0] as string

      const token = await getPayPalAccessToken()
      const res = await fetch(`${paypalApiBase()}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: 'Cancelled by user' }),
      })

      if (!res.ok) {
        const body = await res.text().catch(() => '')
        console.error('[kalak] PayPal cancel subscription failed:', res.status, body)
        // Still mark as cancelled locally — the subscription will eventually expire
      }

      db.run(
        `UPDATE premium_subscriptions SET status = 'cancelled', updated_at = datetime('now') WHERE subscription_id = ?`,
        [subscriptionId]
      )
      persistToDisk()

      ack?.({ success: true, isPremium: false })
    } catch (err) {
      console.error('[kalak] cancel_premium_subscription failed:', err)
      ack?.({ success: false, error: 'cancel_premium_failed' })
    }
  })

  // Called by the client on mount to check premium status. Also auto-activates
  // pending subscriptions by verifying with PayPal — this handles the case where
  // the user approved in the PayPal popup while the app was open.
  safeOn(socket, 'get_premium_status', async (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = _payload as { deviceId?: string } | undefined
    const deviceId = asString(payload?.deviceId)
    if (!deviceId) return ack?.({ error: 'deviceId required' })

    try {
      const db = getDb()
      const rows = db.exec(
        `SELECT subscription_id, status FROM premium_subscriptions WHERE device_id = ? ORDER BY created_at DESC LIMIT 1`,
        [deviceId]
      )

      if (rows.length === 0 || rows[0].values.length === 0) {
        return ack?.({ isPremium: false })
      }

      const [subscriptionId, localStatus] = rows[0].values[0] as [string, string]

      if (localStatus === 'active') {
        return ack?.({ isPremium: true })
      }

      // Pending or cancelled — check PayPal in case status changed externally
      if (localStatus === 'pending' || localStatus === 'cancelled') {
        try {
          const token = await getPayPalAccessToken()
          const res = await fetch(`${paypalApiBase()}/v1/billing/subscriptions/${subscriptionId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.ok) {
            const data = await res.json()
            if (data.status === 'ACTIVE') {
              db.run(`UPDATE premium_subscriptions SET status = 'active', updated_at = datetime('now') WHERE subscription_id = ?`, [subscriptionId])
              persistToDisk()
              return ack?.({ isPremium: true })
            }
          }
        } catch (err) {
          console.error('[kalak] PayPal status check failed:', err)
        }
      }

      return ack?.({ isPremium: false })
    } catch (err) {
      console.error('[kalak] get_premium_status failed:', err)
      ack?.({ error: 'status_failed' })
    }
  })
}
