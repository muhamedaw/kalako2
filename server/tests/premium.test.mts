import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { io as ioClient, type Socket as ClientSocket } from 'socket.io-client'

process.env.DB_PATH = path.join(os.tmpdir(), `kalak-test-premium-${crypto.randomUUID()}.sqlite`)
process.env.DISABLE_BACKUP_SCHEDULER = 'true'
process.env.JOIN_BASE_URL = 'http://localhost:0'
// No real PAYPAL_CLIENT_ID/SECRET/PLAN_ID set — every test here exercises the graceful
// failure path, since no real PayPal billing plan was ever provided (documented blocker).

const { createApp } = await import('../src/server.mts')

async function startServer() {
  const { httpServer } = await createApp()
  await new Promise<void>((resolve) => httpServer.listen(0, resolve))
  const address = httpServer.address()
  const port = typeof address === 'object' && address ? address.port : 0
  return { httpServer, port }
}

function ackCall<T = any>(socket: ClientSocket, event: string, payload: any, timeoutMs = 5000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`no ack received for "${event}" within ${timeoutMs}ms — handler is not registered or hangs`)), timeoutMs)
    socket.emit(event, payload, (res: T) => {
      clearTimeout(timer)
      resolve(res)
    })
  })
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

// Regression test for a real bug found live: production had zero listener for
// create_premium_subscription (premium.mts was built but never deployed/wired), so every
// subscribe attempt hung with no ack at all — the client's 15s withTimeout was the only
// thing that ever recovered it. This locks down that the event always gets a fast,
// well-formed response, never silence.
test('create_premium_subscription always acks quickly (never hangs), fails gracefully without real PayPal creds', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const deviceId = crypto.randomUUID()
  const res = await ackCall(client, 'create_premium_subscription', { deviceId, plan: 'monthly' }, 3000)
  assert.equal(res.success, false)
  assert.ok(['paypal_create_failed', 'create_premium_failed'].includes(res.error), `unexpected error: ${res.error}`)
})

test('create_premium_subscription rejects missing deviceId without hanging', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const res = await ackCall(client, 'create_premium_subscription', {}, 3000)
  assert.equal(res.success, false)
  assert.equal(res.error, 'deviceId required')
})

test('get_premium_status: brand new device is not premium, never hangs', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const res = await ackCall(client, 'get_premium_status', { deviceId: crypto.randomUUID() }, 3000)
  assert.equal(res.isPremium, false)
})

test('cancel_premium_subscription: no active subscription fails gracefully, not silently', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const res = await ackCall(client, 'cancel_premium_subscription', { deviceId: crypto.randomUUID() }, 3000)
  assert.equal(res.success, false)
  assert.equal(res.error, 'no_active_subscription')
})

test('activate_premium_subscription: unknown subscriptionId fails gracefully (PayPal verify fails)', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const res = await ackCall(client, 'activate_premium_subscription', { deviceId: crypto.randomUUID(), subscriptionId: 'I-BOGUS123' }, 3000)
  assert.equal(res.success, false)
})

test('rate limiting: create_premium_subscription is capped per device', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const deviceId = crypto.randomUUID()
  const results = []
  for (let i = 0; i < 5; i++) {
    results.push(await ackCall(client, 'create_premium_subscription', { deviceId, plan: 'monthly' }, 3000))
  }
  assert.ok(results.some((r) => r.error === 'rate_limited'), 'expected at least one rate_limited response after 5 rapid calls (cap is 3/min)')
})
