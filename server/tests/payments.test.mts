import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { io as ioClient, type Socket as ClientSocket } from 'socket.io-client'

process.env.DB_PATH = path.join(os.tmpdir(), `kalak-test-payments-${crypto.randomUUID()}.sqlite`)
process.env.DISABLE_BACKUP_SCHEDULER = 'true'
process.env.RECONNECT_WINDOW_MS = '300'
process.env.JOIN_BASE_URL = 'http://localhost:0'
// Deliberately NOT setting PAYPAL_CLIENT_ID/SECRET here — these tests cover the parts of the
// payment flow that don't require live PayPal credentials (validation + idempotency guard).
delete process.env.PAYPAL_CLIENT_ID
delete process.env.PAYPAL_CLIENT_SECRET

const { createApp } = await import('../src/server.mts')
const { getDb } = await import('../src/db/index.mts')

async function startServer() {
  const { httpServer } = await createApp()
  await new Promise<void>((resolve) => httpServer.listen(0, resolve))
  const address = httpServer.address()
  const port = typeof address === 'object' && address ? address.port : 0
  return { httpServer, port }
}

function waitFor<T = any>(socket: ClientSocket, event: string, ms = 8000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timed out waiting for "${event}"`)), ms)
    socket.once(event, (payload: T) => {
      clearTimeout(timer)
      resolve(payload)
    })
  })
}

function ackCall<T = any>(socket: ClientSocket, event: string, payload: any): Promise<T> {
  return new Promise((resolve) => socket.emit(event, payload, resolve))
}

test('create_paypal_order rejects an unknown tierId before touching PayPal', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const res = await ackCall(client, 'create_paypal_order', { deviceId: crypto.randomUUID(), tierId: 'tier_bogus' })
  assert.equal(res.error, 'invalid_tier')
})

test('create_paypal_order fails gracefully with paypal_not_configured when no credentials are set', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const res = await ackCall(client, 'create_paypal_order', { deviceId: crypto.randomUUID(), tierId: 'tier_small' })
  assert.equal(res.error, 'paypal_not_configured')
})

test('capture_paypal_order rejects an unknown tierId without crashing', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const res = await ackCall(client, 'capture_paypal_order', {
    deviceId: crypto.randomUUID(),
    paypalOrderId: 'FAKE-ORDER-1',
    tierId: 'tier_bogus',
  })
  assert.equal(res.success, false)
  assert.equal(res.reason, 'invalid_tier')
})

test('capture_paypal_order missing fields fails gracefully', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const res = await ackCall(client, 'capture_paypal_order', { deviceId: crypto.randomUUID() })
  assert.equal(res.success, false)
})

test('idempotency: a paypal_order_id already present in transactions is never re-credited', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const deviceId = crypto.randomUUID()
  const paypalOrderId = `SANDBOX-ORDER-${crypto.randomUUID()}`

  // Seed a profile with a known coin balance, then simulate an order that was already
  // captured & credited on a prior request (this is the exact scenario the UNIQUE
  // constraint on paypal_order_id exists to guard against on a client retry/refresh).
  await ackCall(client, 'get_or_create_profile', { deviceId, nickname: 'Buyer' })
  const db = getDb()
  db.run(
    `UPDATE players SET coins = coins + 300 WHERE device_id = ?`,
    [deviceId]
  )
  db.run(
    `INSERT INTO transactions (device_id, paypal_order_id, tier, amount_usd, coins_credited, status)
     VALUES (?, ?, 'tier_medium', 4.99, 300, 'COMPLETED')`,
    [deviceId, paypalOrderId]
  )

  const profileBefore = await ackCall(client, 'get_or_create_profile', { deviceId })
  assert.equal(profileBefore.coins, 300)

  // Retry capture with the same paypalOrderId — must short-circuit on the existing
  // transactions row (never call PayPal, never credit again), regardless of tierId sent.
  const result = await ackCall(client, 'capture_paypal_order', { deviceId, paypalOrderId, tierId: 'tier_medium' })
  assert.equal(result.success, true)
  assert.equal(result.alreadyProcessed, true)
  assert.equal(result.newCoinBalance, 300)

  const profileAfter = await ackCall(client, 'get_or_create_profile', { deviceId })
  assert.equal(profileAfter.coins, 300, 'coins must not be credited twice for the same paypal_order_id')

  const txRows = db.exec(`SELECT COUNT(*) FROM transactions WHERE paypal_order_id = ?`, [paypalOrderId])
  assert.equal(Number(txRows[0].values[0][0]), 1, 'exactly one transactions row for this order')
})
