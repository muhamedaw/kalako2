import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { io as ioClient, type Socket as ClientSocket } from 'socket.io-client'

process.env.DB_PATH = path.join(os.tmpdir(), `kalak-test-recovery-${crypto.randomUUID()}.sqlite`)
process.env.DISABLE_BACKUP_SCHEDULER = 'true'
process.env.JOIN_BASE_URL = 'http://localhost:0'
// No GMAIL_USER/GMAIL_APP_PASSWORD set — every test here exercises the graceful "not
// configured" path, since real credentials were never provided (documented blocker, see final report).

const { createApp } = await import('../src/server.mts')
const { getDb } = await import('../src/db/index.mts')

async function startServer() {
  const { httpServer } = await createApp()
  await new Promise<void>((resolve) => httpServer.listen(0, resolve))
  const address = httpServer.address()
  const port = typeof address === 'object' && address ? address.port : 0
  return { httpServer, port }
}

function ackCall<T = any>(socket: ClientSocket, event: string, payload: any): Promise<T> {
  return new Promise((resolve) => socket.emit(event, payload, resolve))
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

test('add_recovery_email fails gracefully with email_not_configured when Gmail SMTP credentials are unset', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const deviceId = crypto.randomUUID()
  const res = await ackCall(client, 'add_recovery_email', { deviceId, email: 'someone@example.com' })
  assert.equal(res.success, false)
  assert.equal(res.error, 'email_not_configured')

  // No recovery code should have been written since we bailed before generating one.
  const db = getDb()
  const rows = db.exec(`SELECT 1 FROM recovery_codes WHERE device_id = ?`, [deviceId])
  assert.equal(rows.length, 0)
})

test('add_recovery_email rejects malformed email and missing deviceId', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const res1 = await ackCall(client, 'add_recovery_email', { deviceId: crypto.randomUUID(), email: 'not-an-email' })
  assert.equal(res1.success, false)
  assert.notEqual(res1.error, 'email_not_configured')

  const res2 = await ackCall(client, 'add_recovery_email', { email: 'someone@example.com' })
  assert.equal(res2.success, false)
})

test('confirm_recovery_email: no matching code always returns invalid_or_expired, never crashes', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const deviceId = crypto.randomUUID()
  const res = await ackCall(client, 'confirm_recovery_email', { deviceId, email: 'someone@example.com', code: '000000' })
  assert.equal(res.success, false)
  assert.equal(res.reason, 'invalid_or_expired')
})

test('confirm_recovery_email: a real pending code confirms and sets players.email, and is single-use', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const deviceId = crypto.randomUUID()
  await ackCall(client, 'get_or_create_profile', { deviceId, nickname: 'Recoverer' })

  // Bypass the Resend dependency directly by inserting the code row exactly as
  // add_recovery_email would, so this test exercises confirm_recovery_email in isolation.
  const db = getDb()
  const code = '123456'
  db.run(
    `INSERT INTO recovery_codes (email, code, device_id, purpose, expires_at) VALUES (?, ?, ?, 'link_email', datetime('now', '+10 minutes'))`,
    ['someone@example.com', code, deviceId]
  )

  const wrongCode = await ackCall(client, 'confirm_recovery_email', { deviceId, email: 'someone@example.com', code: '999999' })
  assert.equal(wrongCode.success, false)

  const res = await ackCall(client, 'confirm_recovery_email', { deviceId, email: 'someone@example.com', code })
  assert.equal(res.success, true)

  const row = db.exec(`SELECT email FROM players WHERE device_id = ?`, [deviceId])
  assert.equal(row[0].values[0][0], 'someone@example.com')

  // Single-use: the same code must not confirm twice.
  const replay = await ackCall(client, 'confirm_recovery_email', { deviceId, email: 'someone@example.com', code })
  assert.equal(replay.success, false)
  assert.equal(replay.reason, 'invalid_or_expired')
})

test('confirm_recovery_email: an expired code is rejected', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const deviceId = crypto.randomUUID()
  const db = getDb()
  const code = '654321'
  db.run(
    `INSERT INTO recovery_codes (email, code, device_id, purpose, expires_at) VALUES (?, ?, ?, 'link_email', datetime('now', '-1 minutes'))`,
    ['expired@example.com', code, deviceId]
  )

  const res = await ackCall(client, 'confirm_recovery_email', { deviceId, email: 'expired@example.com', code })
  assert.equal(res.success, false)
  assert.equal(res.reason, 'invalid_or_expired')
})

test('request_account_recovery ALWAYS returns success:true — matching email, unknown email, and malformed input are indistinguishable (anti-enumeration)', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const deviceId = crypto.randomUUID()
  const db = getDb()
  await ackCall(client, 'get_or_create_profile', { deviceId, nickname: 'HasEmail' })
  db.run(`UPDATE players SET email = ? WHERE device_id = ?`, ['real@example.com', deviceId])

  const resKnown = await ackCall(client, 'request_account_recovery', { email: 'real@example.com' })
  assert.deepEqual(resKnown, { success: true })

  const resUnknown = await ackCall(client, 'request_account_recovery', { email: 'nobody-has-this@example.com' })
  assert.deepEqual(resUnknown, { success: true })

  const resMalformed = await ackCall(client, 'request_account_recovery', { email: 'not-an-email' })
  assert.deepEqual(resMalformed, { success: true })

  // A code should only have been generated for the real, matching account.
  const rows = db.exec(`SELECT device_id FROM recovery_codes WHERE purpose = 'recover_account'`)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].values.length, 1)
  assert.equal(rows[0].values[0][0], deviceId)
})

test('confirm_account_recovery: valid code transfers nickname/avatar/coins/inventory to newDeviceId, adds to (not overwrites) existing coins, and old device is emptied', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const oldDeviceId = crypto.randomUUID()
  const newDeviceId = crypto.randomUUID()
  const db = getDb()

  await ackCall(client, 'get_or_create_profile', { deviceId: oldDeviceId, nickname: 'OldMe' })
  db.run(`UPDATE players SET coins = 500, email = ? WHERE device_id = ?`, ['recover@example.com', oldDeviceId])
  db.run(`INSERT INTO inventory (device_id, item_id) VALUES (?, 'frame_gold')`, [oldDeviceId])

  // New device already exists as its own guest profile with its own coins.
  await ackCall(client, 'get_or_create_profile', { deviceId: newDeviceId, nickname: 'NewGuest' })
  db.run(`UPDATE players SET coins = 20 WHERE device_id = ?`, [newDeviceId])

  const code = '111222'
  db.run(
    `INSERT INTO recovery_codes (email, code, device_id, purpose, expires_at) VALUES (?, ?, ?, 'recover_account', datetime('now', '+10 minutes'))`,
    ['recover@example.com', code, oldDeviceId]
  )

  const res = await ackCall(client, 'confirm_account_recovery', { email: 'recover@example.com', code, newDeviceId })
  assert.equal(res.success, true)
  assert.equal(res.profile.deviceId, newDeviceId)
  assert.equal(res.profile.nickname, 'OldMe')
  assert.equal(res.profile.coins, 520) // 500 transferred + 20 already on new device
  assert.deepEqual(res.profile.inventory.map((i: any) => i.itemId), ['frame_gold'])

  const oldRow = db.exec(`SELECT coins, email FROM players WHERE device_id = ?`, [oldDeviceId])
  assert.equal(Number(oldRow[0].values[0][0]), 0)
  assert.equal(oldRow[0].values[0][1], null)

  const oldInv = db.exec(`SELECT 1 FROM inventory WHERE device_id = ?`, [oldDeviceId])
  assert.equal(oldInv.length, 0)

  // Single-use: code must not work twice.
  const replay = await ackCall(client, 'confirm_account_recovery', { email: 'recover@example.com', code, newDeviceId })
  assert.equal(replay.success, false)
  assert.equal(replay.reason, 'invalid_or_expired')
})

test('confirm_account_recovery: wrong code, wrong email, and missing newDeviceId all fail with invalid_or_expired', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const res1 = await ackCall(client, 'confirm_account_recovery', { email: 'nope@example.com', code: '000000', newDeviceId: crypto.randomUUID() })
  assert.equal(res1.success, false)
  assert.equal(res1.reason, 'invalid_or_expired')

  const res2 = await ackCall(client, 'confirm_account_recovery', { email: 'nope@example.com', code: '000000' })
  assert.equal(res2.success, false)
})

test('rate limiting: request_account_recovery is capped per email even though every response looks identical', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const email = `ratelimited-${crypto.randomUUID()}@example.com`
  const deviceId = crypto.randomUUID()
  const db = getDb()
  await ackCall(client, 'get_or_create_profile', { deviceId, nickname: 'Capped' })
  db.run(`UPDATE players SET email = ? WHERE device_id = ?`, [email, deviceId])

  for (let i = 0; i < 6; i++) {
    const res = await ackCall(client, 'request_account_recovery', { email })
    assert.deepEqual(res, { success: true }) // always success, even once rate-limited
  }

  // Only the allowed number of codes (3 per hour, per recovery.mts) should have been generated,
  // not one per call — this is what proves the rate limit is real, not just a friendly response.
  const rows = db.exec(`SELECT COUNT(*) FROM recovery_codes WHERE email = ? AND purpose = 'recover_account'`, [email])
  const count = Number(rows[0].values[0][0])
  assert.equal(count, 3)
})
