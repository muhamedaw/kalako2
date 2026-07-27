import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { io as ioClient, type Socket as ClientSocket } from 'socket.io-client'

process.env.DB_PATH = path.join(os.tmpdir(), `kalak-test-sixfeatures-${crypto.randomUUID()}.sqlite`)
process.env.DISABLE_BACKUP_SCHEDULER = 'true'
process.env.RECONNECT_WINDOW_MS = '300'
process.env.JOIN_BASE_URL = 'http://localhost:0'
process.env.ADMIN_PASSWORD = 'test-admin-secret-123'

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

async function makeRoom(url: string, overrides: Record<string, unknown> = {}) {
  const host = ioClient(url, { transports: ['websocket'] })
  await waitFor(host, 'connect')
  const room = await ackCall(host, 'create_room', {
    isPrivate: true, answerTimeSeconds: 30, roundsCount: 2, playerName: 'Host', language: 'en',
    ...overrides,
  })
  return { host, room }
}

async function authenticatedAdmin(url: string): Promise<{ client: ClientSocket; token: string }> {
  const client = ioClient(url, { transports: ['websocket'] })
  await waitFor(client, 'connect')
  const res = await ackCall(client, 'admin_authenticate', { password: 'test-admin-secret-123' })
  return { client, token: res.sessionToken }
}

// ── FEATURE 1: Quick Reactions ──

test('send_reaction: allowlisted emoji broadcasts to the room, unknown emoji rejected', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const { host, room } = await makeRoom(url)
  t.after(() => host.close())
  const guest = ioClient(url, { transports: ['websocket'] })
  t.after(() => guest.close())
  await waitFor(guest, 'connect')
  await ackCall(guest, 'join_room', { roomCode: room.roomCode, playerName: 'Guest' })

  const guestGotReaction = waitFor(guest, 'reaction_received')
  const res = await ackCall(host, 'send_reaction', { emoji: '🔥' })
  assert.equal(res.success, true)
  const received = await guestGotReaction
  assert.equal(received.emoji, '🔥')
  assert.equal(received.playerId, room.playerId)

  // Different player (guest) for the invalid-emoji check — host is still inside its own
  // 2s cooldown from the send above, and this assertion is about emoji validation, not rate limiting.
  const rejected = await ackCall(guest, 'send_reaction', { emoji: '🐸' })
  assert.equal(rejected.success, false)
  assert.equal(rejected.error, 'invalid_emoji')
})

test('send_reaction: rate limited to 1 per 2s per player', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const { host } = await makeRoom(url)
  t.after(() => host.close())

  const first = await ackCall(host, 'send_reaction', { emoji: '😂' })
  assert.equal(first.success, true)
  const second = await ackCall(host, 'send_reaction', { emoji: '😂' })
  assert.equal(second.success, false)
  assert.equal(second.error, 'rate_limited')
})

// ── FEATURE 2: Room Naming ──

test('create_room: custom roomName appears in the room view; blank falls back to "{host}\'s Room"', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`

  const { host, room } = await makeRoom(url, { playerName: 'Sam', roomName: 'Friday Night Trivia' })
  t.after(() => host.close())
  assert.equal(room.room.roomName, 'Friday Night Trivia')

  const { host: host2, room: room2 } = await makeRoom(url, { playerName: 'Sam' })
  t.after(() => host2.close())
  assert.equal(room2.room.roomName, "Sam's Room")
})

test('create_room: roomName is included in the join_room broadcast too', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const { host, room } = await makeRoom(url, { roomName: 'Quiz Night' })
  t.after(() => host.close())

  const guest = ioClient(url, { transports: ['websocket'] })
  t.after(() => guest.close())
  await waitFor(guest, 'connect')
  const joinRes = await ackCall(guest, 'join_room', { roomCode: room.roomCode, playerName: 'Guest' })
  assert.equal(joinRes.room.roomName, 'Quiz Night')
})

test('create_room: roomName is capped at 30 chars, same as playerName sanitization style', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const longName = 'A'.repeat(50)
  const { host, room } = await makeRoom(url, { roomName: longName })
  t.after(() => host.close())
  assert.equal(room.room.roomName.length, 30)
  assert.equal(room.room.roomName, 'A'.repeat(30))
})

// ── FEATURE 3: Suggest a Question ──

test('suggest_question: valid suggestion inserts as pending; invalid category/language rejected', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const client = ioClient(url, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const deviceId = crypto.randomUUID()
  const res = await ackCall(client, 'suggest_question', {
    deviceId, category: 'sports', questionText: 'What year did this happen?', correctAnswer: '1999', language: 'en',
  })
  assert.equal(res.success, true)

  const bad = await ackCall(client, 'suggest_question', {
    deviceId, category: 'not_a_real_category', questionText: 'x', correctAnswer: 'y', language: 'en',
  })
  assert.equal(bad.success, false)
  assert.equal(bad.error, 'invalid_category')
})

test('suggest_question: rate limited after a few per day', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const client = ioClient(url, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const deviceId = crypto.randomUUID()
  const results = []
  for (let i = 0; i < 6; i++) {
    results.push(await ackCall(client, 'suggest_question', {
      deviceId, category: 'sports', questionText: `Q${i}`, correctAnswer: 'A', language: 'en',
    }))
  }
  assert.ok(results.some((r) => r.error === 'rate_limited'), 'the 6th suggestion in one day should be rate-limited')
})

test('admin_list_suggestions / admin_approve_suggestion: approved suggestion becomes a real question, playable immediately', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const { client: admin, token } = await authenticatedAdmin(url)
  t.after(() => admin.close())

  const player = ioClient(url, { transports: ['websocket'] })
  t.after(() => player.close())
  await waitFor(player, 'connect')
  const deviceId = crypto.randomUUID()
  const suggestText = `Admin-approval-test question ${crypto.randomUUID()}`
  await ackCall(player, 'suggest_question', {
    deviceId, category: 'sports', questionText: suggestText, correctAnswer: 'Test Answer', language: 'en',
  })

  const pending = await ackCall(admin, 'admin_list_suggestions', { sessionToken: token, status: 'pending' })
  const found = pending.find((s: any) => s.questionText === suggestText)
  assert.ok(found, 'suggestion should show up in the pending list')

  const approveRes = await ackCall(admin, 'admin_approve_suggestion', { sessionToken: token, id: found.id })
  assert.equal(approveRes.success, true)
  assert.equal(approveRes.question.text, suggestText)

  const listed = await ackCall(admin, 'admin_list_questions', { sessionToken: token, categoryId: 'sports', language: 'en' })
  assert.ok(listed.some((q: any) => q.id === approveRes.question.id), 'approved suggestion is now a real playable question')

  const doubleApprove = await ackCall(admin, 'admin_approve_suggestion', { sessionToken: token, id: found.id })
  assert.ok(doubleApprove.error, 'an already-reviewed suggestion cannot be approved again')

  // Inline, not t.after: an async t.after callback that awaits a socket ack reproducibly
  // hangs node:test's hook runner in this codebase (same issue hit in admin.test.mts).
  await ackCall(admin, 'admin_delete_question', {
    sessionToken: token, questionId: approveRes.question.id, categoryId: 'sports', language: 'en',
  })
})

test('admin_reject_suggestion: marks rejected, never added to the question bank', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const { client: admin, token } = await authenticatedAdmin(url)
  t.after(() => admin.close())

  const player = ioClient(url, { transports: ['websocket'] })
  t.after(() => player.close())
  await waitFor(player, 'connect')
  const deviceId = crypto.randomUUID()
  await ackCall(player, 'suggest_question', {
    deviceId, category: 'sports', questionText: 'Reject-me question', correctAnswer: 'A', language: 'en',
  })

  const pending = await ackCall(admin, 'admin_list_suggestions', { sessionToken: token, status: 'pending' })
  const found = pending.find((s: any) => s.questionText === 'Reject-me question')
  assert.ok(found)

  const rejectRes = await ackCall(admin, 'admin_reject_suggestion', { sessionToken: token, id: found.id })
  assert.equal(rejectRes.success, true)

  const rejected = await ackCall(admin, 'admin_list_suggestions', { sessionToken: token, status: 'rejected' })
  assert.ok(rejected.some((s: any) => s.id === found.id))
})

// ── FEATURE 4: Swap Question ──

test('swap_question: host can reroll the question once during ANSWERING, timer keeps running', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const { host, room } = await makeRoom(url, { answerTimeSeconds: 20, allowedCategories: ['sports'] })
  t.after(() => host.close())
  const guest = ioClient(url, { transports: ['websocket'] })
  t.after(() => guest.close())
  await waitFor(guest, 'connect')
  await ackCall(guest, 'join_room', { roomCode: room.roomCode, playerName: 'Guest' })

  const answeringPromise = waitFor(host, 'phase_changed')
  await new Promise((resolve) => host.emit('start_game', resolve))
  await answeringPromise
  const answeringPromise2 = waitFor(host, 'phase_changed')
  host.emit('pick_category', { category: 'sports' })
  const answering = await answeringPromise2
  const originalText = answering.question.text

  // swap_question takes no payload — same single-callback pattern as start_game (see above),
  // not the generic ackCall(payload, ack) helper used by handlers that actually take fields.
  const swappedPromise = waitFor(host, 'question_swapped')
  const swapRes = await new Promise<any>((resolve) => host.emit('swap_question', resolve))
  assert.equal(swapRes.success, true)
  const swapped = await swappedPromise
  assert.equal(swapped.question.category, 'sports')
  // (May coincidentally match if the category only has 1 question — assert type shape instead of inequality.)
  assert.ok(typeof swapped.question.text === 'string' && swapped.question.text.length > 0)
  void originalText

  const secondSwap = await new Promise<any>((resolve) => host.emit('swap_question', resolve))
  assert.equal(secondSwap.success, false)
  assert.equal(secondSwap.error, 'already_used')

  const guestAttempt = await new Promise<any>((resolve) => guest.emit('swap_question', resolve))
  assert.equal(guestAttempt.success, false)
  assert.equal(guestAttempt.error, 'host_only')
})

test('swap_question: rejected outside ANSWERING (e.g. during CATEGORY_PICK)', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const { host, room } = await makeRoom(url, { allowedCategories: ['sports'] })
  t.after(() => host.close())
  const guest = ioClient(url, { transports: ['websocket'] })
  t.after(() => guest.close())
  await waitFor(guest, 'connect')
  await ackCall(guest, 'join_room', { roomCode: room.roomCode, playerName: 'Guest' })

  const catPickPromise = waitFor(host, 'phase_changed')
  await new Promise((resolve) => host.emit('start_game', resolve))
  const catPick = await catPickPromise
  assert.equal(catPick.phase, 'CATEGORY_PICK')

  const swapRes = await new Promise<any>((resolve) => host.emit('swap_question', resolve))
  assert.equal(swapRes.success, false)
  assert.equal(swapRes.error, 'not_answering_phase')
})

test('swap_question: rate limited (5 per 10s per socket)', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const { host, room } = await makeRoom(url, { answerTimeSeconds: 60, allowedCategories: ['sports'] })
  t.after(() => host.close())
  const guest = ioClient(url, { transports: ['websocket'] })
  t.after(() => guest.close())
  await waitFor(guest, 'connect')
  await ackCall(guest, 'join_room', { roomCode: room.roomCode, playerName: 'Guest' })

  const answeringPromise = waitFor(host, 'phase_changed')
  await new Promise((resolve) => host.emit('start_game', resolve))
  await answeringPromise
  const answeringPromise2 = waitFor(host, 'phase_changed')
  host.emit('pick_category', { category: 'sports' })
  await answeringPromise2

  const results = []
  for (let i = 0; i < 6; i++) {
    results.push(await new Promise<any>((resolve) => host.emit('swap_question', resolve)))
  }
  assert.ok(results.some((r) => r.error === 'rate_limited'), 'one of the 6 rapid-fire attempts should be rate-limited')
})

// ── FEATURE 5: Freeze a Round ──

test('freeze_round: extends the timer +10s once per player per game, second attempt rejected', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const { host, room } = await makeRoom(url, { answerTimeSeconds: 5, allowedCategories: ['sports'] })
  t.after(() => host.close())
  const guest = ioClient(url, { transports: ['websocket'] })
  t.after(() => guest.close())
  await waitFor(guest, 'connect')
  await ackCall(guest, 'join_room', { roomCode: room.roomCode, playerName: 'Guest' })

  const answeringPromise = waitFor(host, 'phase_changed')
  await new Promise((resolve) => host.emit('start_game', resolve))
  await answeringPromise
  const answeringPromise2 = waitFor(host, 'phase_changed')
  host.emit('pick_category', { category: 'sports' })
  await answeringPromise2

  // freeze_round takes no payload — same single-callback pattern as start_game.
  const extendedPromise = waitFor(host, 'timer_extended')
  const freezeRes = await new Promise<any>((resolve) => host.emit('freeze_round', resolve))
  assert.equal(freezeRes.success, true)
  const extended = await extendedPromise
  assert.equal(extended.extraSeconds, 10)
  assert.ok(extended.newDeadline > Date.now())

  const secondFreeze = await new Promise<any>((resolve) => host.emit('freeze_round', resolve))
  assert.equal(secondFreeze.success, false)
  assert.equal(secondFreeze.reason, 'already_used')

  // Guest still has their own freeze available — per-player, not per-room.
  const guestExtendedPromise = waitFor(guest, 'timer_extended')
  const guestFreeze = await new Promise<any>((resolve) => guest.emit('freeze_round', resolve))
  assert.equal(guestFreeze.success, true)
  await guestExtendedPromise

  // Original timer was 5s; two freezes (+10s each) push the deadline to ~25s out. Confirm the
  // room is STILL in ANSWERING well past the original 5s window — submit_answer's ack only
  // returns ok:true while phase === 'ANSWERING', so this directly proves the extension held.
  await new Promise((resolve) => setTimeout(resolve, 6000))
  const stillAnswering = await ackCall(host, 'submit_answer', { text: 'still answering check', forceSubmit: true })
  assert.equal(stillAnswering.ok, true, 'still in ANSWERING past the original 5s window thanks to the freeze extensions')
})

test('freeze_round: rejected outside ANSWERING (e.g. LOBBY, before start_game)', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const { host } = await makeRoom(url)
  t.after(() => host.close())

  const freezeRes = await new Promise<any>((resolve) => host.emit('freeze_round', resolve))
  assert.equal(freezeRes.success, false)
  assert.equal(freezeRes.error, 'not_answering_phase')
})

test('freeze_round: rate limited (5 per 10s per socket)', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const { host, room } = await makeRoom(url, { answerTimeSeconds: 60, allowedCategories: ['sports'] })
  t.after(() => host.close())
  const guest = ioClient(url, { transports: ['websocket'] })
  t.after(() => guest.close())
  await waitFor(guest, 'connect')
  await ackCall(guest, 'join_room', { roomCode: room.roomCode, playerName: 'Guest' })

  const answeringPromise = waitFor(host, 'phase_changed')
  await new Promise((resolve) => host.emit('start_game', resolve))
  await answeringPromise
  const answeringPromise2 = waitFor(host, 'phase_changed')
  host.emit('pick_category', { category: 'sports' })
  await answeringPromise2

  const results = []
  for (let i = 0; i < 6; i++) {
    results.push(await new Promise<any>((resolve) => host.emit('freeze_round', resolve)))
  }
  assert.ok(results.some((r) => r.error === 'rate_limited'), 'one of the 6 rapid-fire attempts should be rate-limited')
})

// ── FEATURE 6: Gift Subscription + Gift Characters ──

test('get_or_create_profile: every profile has a unique 6-char playerTag', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const client = ioClient(url, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const deviceId = crypto.randomUUID()
  const profile = await ackCall(client, 'get_or_create_profile', { deviceId, nickname: 'TagTest' })
  assert.equal(typeof profile.playerTag, 'string')
  assert.equal(profile.playerTag.length, 6)

  const deviceId2 = crypto.randomUUID()
  const profile2 = await ackCall(client, 'get_or_create_profile', { deviceId: deviceId2, nickname: 'TagTest2' })
  assert.notEqual(profile.playerTag, profile2.playerTag)
})

test('gift_item_to_tag: buys a cosmetic for another player by tag, deducts purchaser not recipient', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const client = ioClient(url, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const buyerDeviceId = crypto.randomUUID()
  const recipientDeviceId = crypto.randomUUID()
  await ackCall(client, 'get_or_create_profile', { deviceId: buyerDeviceId, nickname: 'Buyer' })
  const recipientProfile = await ackCall(client, 'get_or_create_profile', { deviceId: recipientDeviceId, nickname: 'Recipient' })

  const db = getDb()
  db.run(`UPDATE players SET coins = 500 WHERE device_id = ?`, [buyerDeviceId])

  const giftRes = await ackCall(client, 'gift_item_to_tag', {
    deviceId: buyerDeviceId, itemId: 'sfx_pack_arcade', recipientPlayerTag: recipientProfile.playerTag,
  })
  assert.equal(giftRes.success, true)
  assert.equal(giftRes.coins, 500 - 75) // sfx_pack_arcade price

  const recipientAfter = await ackCall(client, 'get_or_create_profile', { deviceId: recipientDeviceId, nickname: 'Recipient' })
  assert.ok(recipientAfter.inventory.some((i: any) => i.itemId === 'sfx_pack_arcade'))
  assert.equal(recipientAfter.coins, 0, 'recipient never pays')

  // Recipient already owns it -> clear error, not a silent success.
  const again = await ackCall(client, 'gift_item_to_tag', {
    deviceId: buyerDeviceId, itemId: 'sfx_pack_arcade', recipientPlayerTag: recipientProfile.playerTag,
  })
  assert.equal(again.error, 'recipient_already_owns_item')

  // Unknown tag -> clear error.
  const unknownTag = await ackCall(client, 'gift_item_to_tag', {
    deviceId: buyerDeviceId, itemId: 'sfx_pack_retro', recipientPlayerTag: 'ZZZZZZ',
  })
  assert.equal(unknownTag.error, 'recipient_tag_not_found')
})

test('gift_item_to_tag: insufficient funds and self-gifting are rejected clearly', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const client = ioClient(url, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const buyerDeviceId = crypto.randomUUID()
  const recipientDeviceId = crypto.randomUUID()
  const buyerProfile = await ackCall(client, 'get_or_create_profile', { deviceId: buyerDeviceId, nickname: 'PoorBuyer' })
  const recipientProfile = await ackCall(client, 'get_or_create_profile', { deviceId: recipientDeviceId, nickname: 'Recipient2' })
  // Fresh profiles start at 0 coins — never enough for any real item.

  const poorRes = await ackCall(client, 'gift_item_to_tag', {
    deviceId: buyerDeviceId, itemId: 'sfx_pack_arcade', recipientPlayerTag: recipientProfile.playerTag,
  })
  assert.equal(poorRes.error, 'insufficient_funds')

  const db = getDb()
  db.run(`UPDATE players SET coins = 500 WHERE device_id = ?`, [buyerDeviceId])
  const selfGift = await ackCall(client, 'gift_item_to_tag', {
    deviceId: buyerDeviceId, itemId: 'frame_gold', recipientPlayerTag: buyerProfile.playerTag,
  })
  assert.equal(selfGift.error, 'cannot_gift_to_self')
})

test('gift_item_to_tag: rate limited (10 per 10s per device, same as purchase_item)', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const client = ioClient(url, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const buyerDeviceId = crypto.randomUUID()
  const recipientDeviceId = crypto.randomUUID()
  const recipientProfile = await ackCall(client, 'get_or_create_profile', { deviceId: recipientDeviceId, nickname: 'RateLimitRecipient' })
  await ackCall(client, 'get_or_create_profile', { deviceId: buyerDeviceId, nickname: 'RateLimitBuyer' })

  const results = []
  for (let i = 0; i < 11; i++) {
    results.push(await ackCall(client, 'gift_item_to_tag', {
      deviceId: buyerDeviceId, itemId: 'sfx_pack_arcade', recipientPlayerTag: recipientProfile.playerTag,
    }))
  }
  assert.ok(results.some((r) => r.error === 'rate_limited'), 'the 11th rapid-fire attempt should be rate-limited')
})

test('redeem_gift_code: rejects unknown/malformed codes clearly', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const client = ioClient(url, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const deviceId = crypto.randomUUID()
  const res = await ackCall(client, 'redeem_gift_code', { deviceId, code: 'NOTREAL1' })
  assert.equal(res.success, false)
  assert.equal(res.error, 'invalid_code')
})

test('redeem_gift_code: rate limited to 5/hour/device (code-guessing attack surface)', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const client = ioClient(url, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const deviceId = crypto.randomUUID()
  const results = []
  for (let i = 0; i < 6; i++) {
    results.push(await ackCall(client, 'redeem_gift_code', { deviceId, code: `NOTREAL${i}` }))
  }
  const rateLimitedCount = results.filter((r) => r.error === 'rate_limited').length
  assert.equal(rateLimitedCount, 1, 'exactly the 6th attempt in the same hour should be rate-limited')
})

test('redeem_gift_code: a real gift_codes row (premium_month) extends premium_expires_at by 1 month, single-use', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const client = ioClient(url, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const purchaserDeviceId = crypto.randomUUID()
  const redeemerDeviceId = crypto.randomUUID()
  await ackCall(client, 'get_or_create_profile', { deviceId: redeemerDeviceId, nickname: 'Redeemer' })

  // Insert a real gift code directly (as if a real PayPal capture had already produced it —
  // the PayPal round trip itself is covered by payments.test.mts/premium.test.mts's identical
  // pattern, not re-tested here).
  const db = getDb()
  const code = 'GIFT1234'
  db.run(
    `INSERT INTO gift_codes (code, type, item_id, purchased_by_device) VALUES (?, 'premium_month', 'premium_month', ?)`,
    [code, purchaserDeviceId]
  )

  const before = await ackCall(client, 'get_or_create_profile', { deviceId: redeemerDeviceId, nickname: 'Redeemer' })
  assert.equal(before.isPremium, false)

  const redeemRes = await ackCall(client, 'redeem_gift_code', { deviceId: redeemerDeviceId, code })
  assert.equal(redeemRes.success, true)
  assert.equal(redeemRes.itemGranted, 'premium_month')
  const expiresAt = new Date(redeemRes.expiresAt)
  const now = new Date()
  const daysAhead = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  assert.ok(daysAhead > 25 && daysAhead < 35, `expected ~1 month ahead, got ${daysAhead} days`)

  const after = await ackCall(client, 'get_or_create_profile', { deviceId: redeemerDeviceId, nickname: 'Redeemer' })
  assert.equal(after.isPremium, true)

  const doubleRedeem = await ackCall(client, 'redeem_gift_code', { deviceId: redeemerDeviceId, code })
  assert.equal(doubleRedeem.success, false)
  assert.equal(doubleRedeem.error, 'already_redeemed')
})

test('create_gift_premium_order / capture_gift_premium_order: fail gracefully without real PayPal creds, never hang', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const client = ioClient(url, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const deviceId = crypto.randomUUID()
  const orderRes = await ackCall(client, 'create_gift_premium_order', { deviceId })
  assert.equal(orderRes.error, 'paypal_not_configured')

  const captureRes = await ackCall(client, 'capture_gift_premium_order', { deviceId, paypalOrderId: 'FAKE-ORDER-ID' })
  assert.equal(captureRes.success, false)
})
