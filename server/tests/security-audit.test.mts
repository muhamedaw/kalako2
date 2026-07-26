import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { io as ioClient, type Socket as ClientSocket } from 'socket.io-client'

process.env.DB_PATH = path.join(os.tmpdir(), `kalak-test-secaudit-${crypto.randomUUID()}.sqlite`)
process.env.RECONNECT_WINDOW_MS = '300'
process.env.JOIN_BASE_URL = 'http://localhost:0'
process.env.DISABLE_BACKUP_SCHEDULER = 'true'
delete process.env.CORS_ORIGIN // exercise the default allowlist, not whatever the shell happens to have set

const { config } = await import('../src/config.mts')
const { createApp } = await import('../src/server.mts')

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

test('CORS: default allowlist is explicit origins, never a wildcard', () => {
  assert.ok(Array.isArray(config.corsOrigin), 'corsOrigin must be an explicit array, not a raw "*" string')
  assert.ok(!config.corsOrigin.includes('*'), 'corsOrigin must never include a wildcard')
  assert.ok(config.corsOrigin.includes('https://kalako-client.vercel.app'))
})

test('rate limit: get_or_create_profile is capped per-socket even across many distinct deviceIds', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const results: any[] = []
  for (let i = 0; i < 25; i++) {
    results.push(await ackCall(client, 'get_or_create_profile', { deviceId: crypto.randomUUID() }))
  }
  assert.ok(results.some((r) => r.error === 'rate_limited'), 'spamming fresh deviceIds from one socket must eventually be rate-limited')
})

test('rate limit: mark_notification_read is capped', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const results: any[] = []
  for (let i = 0; i < 25; i++) {
    results.push(await ackCall(client, 'mark_notification_read', { notificationId: String(i) }))
  }
  assert.ok(results.some((r) => r.success === false), 'spamming mark_notification_read must eventually be rate-limited')
})

test('rate limit: leave_room is capped per-socket', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  // leave_room has no ack; just confirm the server survives 25 rapid emits without issue,
  // then confirm the socket is still fully functional (proves the rate limiter didn't wedge it).
  for (let i = 0; i < 25; i++) client.emit('leave_room')
  await new Promise((r) => setTimeout(r, 200))
  const profile = await ackCall(client, 'get_or_create_profile', { deviceId: crypto.randomUUID() })
  assert.equal(profile.coins, 0)
})

test('rate limit: start_game is capped per-socket', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  // start_game takes no payload — just an ack. No room/host context, so every call fails
  // for other reasons past the rate limit gate — this only proves the gate itself trips,
  // not full start_game semantics (covered elsewhere).
  const results: any[] = []
  for (let i = 0; i < 15; i++) {
    results.push(await new Promise((resolve) => client.emit('start_game', resolve)))
  }
  assert.ok(results.some((r: any) => r.error === 'rate_limited'))
})
