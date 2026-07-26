import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { io as ioClient, type Socket as ClientSocket } from 'socket.io-client'

process.env.DB_PATH = path.join(os.tmpdir(), `kalak-test-economy-${crypto.randomUUID()}.sqlite`)
process.env.DISABLE_BACKUP_SCHEDULER = 'true'
process.env.RECONNECT_WINDOW_MS = '300'
process.env.JOIN_BASE_URL = 'http://localhost:0'

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

test('get_or_create_profile: brand new device starts at 0 coins with empty inventory', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const client = ioClient(url, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const deviceId = crypto.randomUUID()
  const profile = await ackCall(client, 'get_or_create_profile', { deviceId, nickname: 'Newbie' })

  assert.equal(profile.deviceId, deviceId)
  assert.equal(profile.coins, 0)
  assert.deepEqual(profile.inventory, [])
  assert.ok(profile.avatarConfig && typeof profile.avatarConfig === 'object')
})

test('finishing a live game credits coins per formula (10 flat + 5/correct-round + 5/player-tricked) and posts a notification', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const host = ioClient(url, { transports: ['websocket'] })
  const p2 = ioClient(url, { transports: ['websocket'] })
  t.after(() => {
    host.close()
    p2.close()
  })
  await Promise.all([waitFor(host, 'connect'), waitFor(p2, 'connect')])

  const hostDeviceId = crypto.randomUUID()
  const p2DeviceId = crypto.randomUUID()

  const created = await ackCall(host, 'create_room', {
    playerName: 'Host',
    isPrivate: false,
    answerTimeSeconds: 10,
    roundsCount: 1,
    allowedCategories: [],
    deviceId: hostDeviceId,
  })
  await ackCall(p2, 'join_room', { roomCode: created.roomCode, playerName: 'P2', deviceId: p2DeviceId })

  const catWaits = [waitFor(host, 'phase_changed'), waitFor(p2, 'phase_changed')]
  host.emit('start_game')
  const [catPick] = await Promise.all(catWaits)

  const ansWaits = [waitFor(host, 'phase_changed'), waitFor(p2, 'phase_changed')]
  host.emit('pick_category', { category: catPick.categoryOptions[0] })
  await Promise.all(ansWaits)

  const votingPromise = waitFor(host, 'phase_changed')
  host.emit('submit_answer', { text: 'HOST_FAKE' })
  p2.emit('submit_answer', { text: 'P2_FAKE' })
  const voting = await votingPromise
  const correctSlot = voting.answers.find((a: any) => !['HOST_FAKE', 'P2_FAKE'].includes(a.text))
  const hostFakeSlot = voting.answers.find((a: any) => a.text === 'HOST_FAKE')

  const resultsPromise = waitFor(host, 'phase_changed', 15000)
  host.emit('submit_vote', { slotId: correctSlot.slotId }) // host guesses correctly: +1 round-correct
  p2.emit('submit_vote', { slotId: hostFakeSlot.slotId }) // p2 fooled by host: host +1 player-tricked
  await resultsPromise

  await waitFor(host, 'phase_changed', 15000) // GAME_OVER

  // endGame() awards coins synchronously before destroying the room; poll profile right after.
  const hostProfile = await ackCall(host, 'get_or_create_profile', { deviceId: hostDeviceId })
  const p2Profile = await ackCall(p2, 'get_or_create_profile', { deviceId: p2DeviceId })

  assert.equal(hostProfile.coins, 20) // 10 flat + 5*1 correct round + 5*1 player tricked
  assert.equal(p2Profile.coins, 10) // 10 flat only

  const hostNotifs = await ackCall(host, 'get_notifications', { deviceId: hostDeviceId })
  const coinsNotif = hostNotifs.find((n: any) => n.type === 'coins_earned')
  assert.ok(coinsNotif)
  assert.equal(coinsNotif.payload.amount, 20)
  assert.equal(coinsNotif.read, false)
})

test('purchase_item: insufficient funds fails, success after earning enough, repeat purchase fails already_owned', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const host = ioClient(url, { transports: ['websocket'] })
  const p2 = ioClient(url, { transports: ['websocket'] })
  t.after(() => {
    host.close()
    p2.close()
  })
  await Promise.all([waitFor(host, 'connect'), waitFor(p2, 'connect')])

  const hostDeviceId = crypto.randomUUID()

  // Brand new device: 0 coins, buying the 40-coin frame must fail with insufficient_funds.
  await ackCall(host, 'get_or_create_profile', { deviceId: hostDeviceId, nickname: 'Buyer' })
  const failedPurchase = await ackCall(host, 'purchase_item', { deviceId: hostDeviceId, itemId: 'frame_gold' })
  assert.equal(failedPurchase.error, 'insufficient_funds')

  // Play a game so the device earns >= 50 coins. Host guesses correctly and fools p2 every
  // round, so coins = 10 + 5*roundsCorrect + 5*playersTricked = 10 + 5*4 + 5*4 = 50 over 4 rounds.
  const created = await ackCall(host, 'create_room', {
    playerName: 'Host',
    isPrivate: false,
    answerTimeSeconds: 10,
    roundsCount: 4,
    allowedCategories: [],
    deviceId: hostDeviceId,
  })
  await ackCall(p2, 'join_room', { roomCode: created.roomCode, playerName: 'P2' })

  for (let round = 0; round < 4; round++) {
    const catWaits = [waitFor(host, 'phase_changed', 10000), waitFor(p2, 'phase_changed', 10000)]
    if (round === 0) host.emit('start_game')
    const [catPick] = await Promise.all(catWaits)

    const ansWaits = [waitFor(host, 'phase_changed'), waitFor(p2, 'phase_changed')]
    host.emit('pick_category', { category: catPick.categoryOptions[0] })
    await Promise.all(ansWaits)

    const nextPromise = waitFor(host, 'phase_changed', 15000)
    host.emit('submit_answer', { text: `HOST_FAKE_${round}` })
    p2.emit('submit_answer', { text: `P2_FAKE_${round}` })
    const voting = await nextPromise
    const correctSlot = voting.answers.find(
      (a: any) => ![`HOST_FAKE_${round}`, `P2_FAKE_${round}`].includes(a.text)
    )
    const hostFakeSlot = voting.answers.find((a: any) => a.text === `HOST_FAKE_${round}`)

    const afterVotePromise = waitFor(host, 'phase_changed', 15000)
    host.emit('submit_vote', { slotId: correctSlot.slotId })
    p2.emit('submit_vote', { slotId: hostFakeSlot.slotId })
    await afterVotePromise
  }
  await waitFor(host, 'phase_changed', 15000) // GAME_OVER after round 3

  const profileAfterGame = await ackCall(host, 'get_or_create_profile', { deviceId: hostDeviceId })
  assert.ok(profileAfterGame.coins >= 50, `expected >= 50 coins, got ${profileAfterGame.coins}`)

  const successPurchase = await ackCall(host, 'purchase_item', { deviceId: hostDeviceId, itemId: 'frame_gold' })
  assert.equal(successPurchase.success, true)
  assert.ok(successPurchase.inventory.some((i: any) => i.itemId === 'frame_gold'))

  const repeatPurchase = await ackCall(host, 'purchase_item', { deviceId: hostDeviceId, itemId: 'frame_gold' })
  assert.equal(repeatPurchase.error, 'already_owned')
})

// Regression test for a real bug found live: the client emitted the wrong event name
// ('buy_item' instead of 'purchase_item') and showed a success toast unconditionally
// without checking the ack — so purchases visually "succeeded" for players regardless
// of their real coin balance. The server itself was always correct; this test locks
// down that the server-side DB state genuinely never changes on a failed purchase,
// not just that the ack shape says so — the strongest guarantee this layer can give.
test('purchase_item: insufficient funds never mutates DB state, even under repeated attempts', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const deviceId = crypto.randomUUID()
  const initialProfile = await ackCall(client, 'get_or_create_profile', { deviceId, nickname: 'Broke' })
  assert.equal(initialProfile.coins, 0)
  assert.deepEqual(initialProfile.inventory, [])

  // Hammer it several times — a real free-purchase bug (race, missing check, etc.)
  // would show up as coins going negative or the item appearing after any one of these.
  for (let i = 0; i < 5; i++) {
    const res = await ackCall(client, 'purchase_item', { deviceId, itemId: 'sfx_pack_arcade' })
    assert.equal(res.error, 'insufficient_funds')
  }

  const afterProfile = await ackCall(client, 'get_or_create_profile', { deviceId })
  assert.equal(afterProfile.coins, 0, 'coins must still be exactly 0 — never go negative or get spent')
  assert.deepEqual(afterProfile.inventory, [], 'inventory must still be empty — item must never be granted')

  // Same check at a partially-funded boundary (some coins, still short of the price).
  const partialDeviceId = crypto.randomUUID()
  await ackCall(client, 'get_or_create_profile', { deviceId: partialDeviceId })
  const db = getDb()
  db.run(`UPDATE players SET coins = 10 WHERE device_id = ?`, [partialDeviceId]) // frame_gold costs 40
  const partialResult = await ackCall(client, 'purchase_item', { deviceId: partialDeviceId, itemId: 'frame_gold' })
  assert.equal(partialResult.error, 'insufficient_funds')
  const partialProfile = await ackCall(client, 'get_or_create_profile', { deviceId: partialDeviceId })
  assert.equal(partialProfile.coins, 10, 'partial balance must be untouched, not partially deducted')
  assert.deepEqual(partialProfile.inventory, [])
})

test('hall of fame: real historical fooled-answer shows up, and voting is single-per-device', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const host = ioClient(url, { transports: ['websocket'] })
  const p2 = ioClient(url, { transports: ['websocket'] })
  const voter = ioClient(url, { transports: ['websocket'] })
  t.after(() => {
    host.close()
    p2.close()
    voter.close()
  })
  await Promise.all([waitFor(host, 'connect'), waitFor(p2, 'connect'), waitFor(voter, 'connect')])

  const created = await ackCall(host, 'create_room', {
    playerName: 'Host',
    isPrivate: false,
    answerTimeSeconds: 10,
    roundsCount: 1,
    allowedCategories: [],
  })
  await ackCall(p2, 'join_room', { roomCode: created.roomCode, playerName: 'P2' })

  const catWaits = [waitFor(host, 'phase_changed'), waitFor(p2, 'phase_changed')]
  host.emit('start_game')
  const [catPick] = await Promise.all(catWaits)

  const ansWaits = [waitFor(host, 'phase_changed'), waitFor(p2, 'phase_changed')]
  host.emit('pick_category', { category: catPick.categoryOptions[0] })
  await Promise.all(ansWaits)

  const votingPromise = waitFor(host, 'phase_changed')
  host.emit('submit_answer', { text: 'SNEAKY_FAKE_ANSWER' })
  p2.emit('submit_answer', { text: 'P2_FAKE' })
  const voting = await votingPromise
  const correctSlot = voting.answers.find((a: any) => !['SNEAKY_FAKE_ANSWER', 'P2_FAKE'].includes(a.text))
  const sneakySlot = voting.answers.find((a: any) => a.text === 'SNEAKY_FAKE_ANSWER')

  const resultsPromise = waitFor(host, 'phase_changed', 15000)
  host.emit('submit_vote', { slotId: correctSlot.slotId })
  p2.emit('submit_vote', { slotId: sneakySlot.slotId }) // p2 fooled by "SNEAKY_FAKE_ANSWER"
  await resultsPromise
  await waitFor(host, 'phase_changed', 15000) // GAME_OVER -> persists game history

  const hof = await ackCall(voter, 'get_hall_of_fame', {})
  const entry = hof.find((e: any) => e.answerText === 'SNEAKY_FAKE_ANSWER')
  assert.ok(entry, 'fooled answer should appear in hall of fame')
  assert.equal(entry.playerName, 'Host')

  const voterDeviceId = crypto.randomUUID()
  const firstVote = await ackCall(voter, 'vote_hall_of_fame', { deviceId: voterDeviceId, entryId: entry.id })
  assert.equal(firstVote.success, true)
  assert.equal(firstVote.newVoteCount, 1)

  const secondVote = await ackCall(voter, 'vote_hall_of_fame', { deviceId: voterDeviceId, entryId: entry.id })
  assert.equal(secondVote.success, false)
  assert.equal(secondVote.reason, 'already_voted')
})
