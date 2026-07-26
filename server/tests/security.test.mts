import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { io as ioClient, type Socket as ClientSocket } from 'socket.io-client'

process.env.DB_PATH = path.join(os.tmpdir(), `kalak-test-security-${crypto.randomUUID()}.sqlite`)
process.env.DISABLE_BACKUP_SCHEDULER = 'true'
process.env.RECONNECT_WINDOW_MS = '300'
process.env.JOIN_BASE_URL = 'http://localhost:0'

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

test('malformed payloads (null, wrong types) are rejected cleanly, never crash the server', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const client = ioClient(url, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  // Explicit null bypasses a `= {}` default parameter — must not throw inside the handler.
  const createRes = await ackCall(client, 'create_room', null)
  assert.ok(createRes && 'error' in createRes)

  const joinRes = await ackCall(client, 'join_room', null)
  assert.ok(joinRes && 'error' in joinRes)

  client.emit('pick_category', null) // no ack; must not crash the process
  client.emit('submit_vote', null)

  const answerRes = await ackCall(client, 'submit_answer', null)
  assert.equal(answerRes.ok, false)

  // Non-object primitives too.
  const createRes2 = await ackCall(client, 'create_room', 'not-an-object')
  assert.ok(createRes2 && 'error' in createRes2)

  // Wrong-typed fields inside an otherwise-valid-looking object.
  const nicknameRes = await ackCall(client, 'update_profile', {
    deviceId: crypto.randomUUID(),
    nickname: 12345, // number instead of string — must not crash on .trim()
  })
  assert.ok(nicknameRes.deviceId) // handler completed normally, ignored the bad field

  // The server must still be alive and responsive after all of the above.
  const deviceId = crypto.randomUUID()
  const profile = await ackCall(client, 'get_or_create_profile', { deviceId })
  assert.equal(profile.coins, 0)
})

test('rate limiting: rapid-fire purchase_item calls past the limit are rejected, not processed', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const deviceId = crypto.randomUUID()
  await ackCall(client, 'get_or_create_profile', { deviceId })

  const results: any[] = []
  for (let i = 0; i < 15; i++) {
    results.push(await ackCall(client, 'purchase_item', { deviceId, itemId: 'frame_gold' }))
  }

  const rateLimited = results.filter((r) => r.error === 'rate_limited')
  assert.ok(rateLimited.length > 0, 'expected at least one rate_limited response among 15 rapid calls')
})

test('a device that never sends a valid deviceId cannot be rate-limited into affecting other devices', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const deviceA = crypto.randomUUID()
  const deviceB = crypto.randomUUID()
  await ackCall(client, 'get_or_create_profile', { deviceId: deviceA })
  await ackCall(client, 'get_or_create_profile', { deviceId: deviceB })

  for (let i = 0; i < 12; i++) {
    await ackCall(client, 'purchase_item', { deviceId: deviceA, itemId: 'frame_gold' })
  }
  // deviceB's own rate-limit bucket must be untouched by deviceA's spam.
  const resB = await ackCall(client, 'purchase_item', { deviceId: deviceB, itemId: 'frame_gold' })
  assert.notEqual(resB.error, 'rate_limited')
})
