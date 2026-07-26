import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { io as ioClient, type Socket as ClientSocket } from 'socket.io-client'

// This file exercises the real LOG_DIR override, DEBUG_TOKEN gate, and the
// ENABLE_TEST_FAULT_HANDLER fault-injection path — all env-gated so they never touch
// the real server/logs directory or exist in production.
const testLogDir = path.join(os.tmpdir(), `kalak-test-logs-${crypto.randomUUID()}`)
process.env.LOG_DIR = testLogDir
process.env.DB_PATH = path.join(os.tmpdir(), `kalak-test-logging-${crypto.randomUUID()}.sqlite`)
process.env.RECONNECT_WINDOW_MS = '300'
process.env.JOIN_BASE_URL = 'http://localhost:0'
process.env.DISABLE_BACKUP_SCHEDULER = 'true'
process.env.ENABLE_TEST_FAULT_HANDLER = 'true'
process.env.DEBUG_TOKEN = 'test-debug-token-xyz'

const { logError, getRecentErrorLines } = await import('../src/logging/logger.mts')
const { createApp } = await import('../src/server.mts')

function todayLogFile(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return path.join(testLogDir, `error-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.log`)
}

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

test('logError writes one structured JSON line with timestamp/message/stack/context, nothing extra', () => {
  const err = new Error('boom')
  logError(err, { event: 'unit_test_event', deviceId: 'device-123' })

  const content = fs.readFileSync(todayLogFile(), 'utf-8').trim()
  const lines = content.split('\n')
  const entry = JSON.parse(lines[lines.length - 1])

  assert.equal(entry.message, 'boom')
  assert.ok(entry.timestamp)
  assert.ok(entry.stack.includes('Error: boom'))
  assert.equal(entry.event, 'unit_test_event')
  assert.equal(entry.deviceId, 'device-123')
  // Only the known fields — nothing else leaked through.
  assert.deepEqual(Object.keys(entry).sort(), ['deviceId', 'event', 'message', 'stack', 'timestamp'])
})

test('logError truncates a huge stack to 2000 chars and never throws itself', () => {
  const err = new Error('huge')
  err.stack = 'X'.repeat(10_000)
  assert.doesNotThrow(() => logError(err, { event: 'huge_stack_test' }))

  const content = fs.readFileSync(todayLogFile(), 'utf-8').trim()
  const lines = content.split('\n')
  const entry = JSON.parse(lines[lines.length - 1])
  assert.equal(entry.stack.length, 2000)
})

test('logError context can never smuggle extra fields (e.g. a secret) into the log line', () => {
  const err = new Error('leak attempt')
  // @ts-expect-error deliberately passing a field outside ErrorLogContext
  logError(err, { event: 'leak_test', deviceId: 'd1', secret: 'PAYPAL_CLIENT_SECRET_VALUE', payload: { card: '4111...' } })

  const content = fs.readFileSync(todayLogFile(), 'utf-8').trim()
  const lines = content.split('\n')
  const entry = JSON.parse(lines[lines.length - 1])
  assert.equal(entry.secret, undefined)
  assert.equal(entry.payload, undefined)
  assert.ok(!content.includes('PAYPAL_CLIENT_SECRET_VALUE'))
})

test('getRecentErrorLines returns the most recent lines, most recent last', () => {
  for (let i = 0; i < 5; i++) logError(new Error(`seq-${i}`), { event: 'seq_test' })
  const lines = getRecentErrorLines(3)
  assert.equal(lines.length >= 3, true)
  const last = JSON.parse(lines[lines.length - 1])
  assert.equal(last.message, 'seq-4')
})

test('crash resilience: a handler that throws synchronously is caught, logged, does not kill the server or other clients', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const faulty = ioClient(url, { transports: ['websocket'] })
  const bystander = ioClient(url, { transports: ['websocket'] })
  t.after(() => { faulty.close(); bystander.close() })
  await Promise.all([waitFor(faulty, 'connect'), waitFor(bystander, 'connect')])

  faulty.emit('__test_throw', { deviceId: 'faulty-device-sync' })
  await new Promise((r) => setTimeout(r, 300))

  // Server must still be alive and the bystander client fully functional afterward.
  const profile = await ackCall(bystander, 'get_or_create_profile', { deviceId: crypto.randomUUID() })
  assert.equal(profile.coins, 0)

  const content = fs.readFileSync(todayLogFile(), 'utf-8')
  const entries = content.trim().split('\n').map((l) => JSON.parse(l))
  const found = entries.find((e) => e.event === '__test_throw' && e.deviceId === 'faulty-device-sync')
  assert.ok(found, 'the sync throw must have been logged with event + deviceId context')
  assert.match(found.message, /deliberate test fault \(sync\)/)
})

test('crash resilience: a handler whose async work rejects is caught, logged, does not kill the server or other clients', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const faulty = ioClient(url, { transports: ['websocket'] })
  const bystander = ioClient(url, { transports: ['websocket'] })
  t.after(() => { faulty.close(); bystander.close() })
  await Promise.all([waitFor(faulty, 'connect'), waitFor(bystander, 'connect')])

  faulty.emit('__test_reject', { deviceId: 'faulty-device-async' })
  await new Promise((r) => setTimeout(r, 300))

  const profile = await ackCall(bystander, 'get_or_create_profile', { deviceId: crypto.randomUUID() })
  assert.equal(profile.coins, 0)

  const content = fs.readFileSync(todayLogFile(), 'utf-8')
  const entries = content.trim().split('\n').map((l) => JSON.parse(l))
  const found = entries.find((e) => e.event === '__test_reject' && e.deviceId === 'faulty-device-async')
  assert.ok(found, 'the async rejection must have been logged with event + deviceId context')
  assert.match(found.message, /deliberate test fault \(async\)/)
})

test('get_recent_errors: refuses without the correct DEBUG_TOKEN, works with it', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  logError(new Error('for get_recent_errors test'), { event: 'gre_test' })

  const noToken = await ackCall(client, 'get_recent_errors', {})
  assert.equal(noToken.error, 'unauthorized')

  const wrongToken = await ackCall(client, 'get_recent_errors', { token: 'wrong-token' })
  assert.equal(wrongToken.error, 'unauthorized')

  const rightToken = await ackCall(client, 'get_recent_errors', { token: 'test-debug-token-xyz' })
  assert.ok(Array.isArray(rightToken.lines))
  assert.ok(rightToken.lines.some((l: string) => l.includes('gre_test')))
})
