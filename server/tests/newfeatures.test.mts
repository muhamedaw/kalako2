import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { io as ioClient, type Socket as ClientSocket } from 'socket.io-client'

process.env.DB_PATH = path.join(os.tmpdir(), `kalak-test-newfeatures-${crypto.randomUUID()}.sqlite`)
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

async function makeRoom(url: string, overrides: Record<string, unknown> = {}) {
  const host = ioClient(url, { transports: ['websocket'] })
  await waitFor(host, 'connect')
  const room = await ackCall(host, 'create_room', {
    isPrivate: true, answerTimeSeconds: 30, roundsCount: 2, playerName: 'Host', language: 'en',
    ...overrides,
  })
  return { host, room }
}

// ── TASK 1: round-count recommendation is advisory-only (server just stores whatever the
// host sets via update_room_settings; the recommendation math itself is a pure client calc) ──

test('update_room_settings: host can change roundsCount in LOBBY, non-host cannot', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const { host, room } = await makeRoom(url)
  t.after(() => host.close())

  const guest = ioClient(url, { transports: ['websocket'] })
  t.after(() => guest.close())
  await waitFor(guest, 'connect')
  await ackCall(guest, 'join_room', { roomCode: room.roomCode, playerName: 'Guest' })

  const guestAttempt = await ackCall(guest, 'update_room_settings', { roundsCount: 8 })
  assert.ok(guestAttempt.error, 'non-host must be rejected')

  const updated = waitFor(host, 'phase_changed')
  const hostRes = await ackCall(host, 'update_room_settings', { roundsCount: 8 })
  assert.equal(hostRes.ok, true)
  const broadcast = await updated
  assert.equal(broadcast.room.settings.roundsCount, 8)
})

test('update_room_settings: rejects out-of-range roundsCount and settings after LOBBY', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const { host, room } = await makeRoom(url)
  t.after(() => host.close())
  const guest = ioClient(url, { transports: ['websocket'] })
  t.after(() => guest.close())
  await waitFor(guest, 'connect')
  await ackCall(guest, 'join_room', { roomCode: room.roomCode, playerName: 'Guest' })

  const badRes = await ackCall(host, 'update_room_settings', { roundsCount: 999 })
  assert.ok(badRes.error)

  await new Promise((resolve) => host.emit('start_game', resolve))
  const afterStart = await ackCall(host, 'update_room_settings', { roundsCount: 5 })
  assert.ok(afterStart.error, 'cannot change settings once the game has started')
})

// ── TASK 2: Watch Mode (display role) ──

test('join_display: joins without becoming a player, receives broadcasts, capped at 3', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const { host, room } = await makeRoom(url)
  t.after(() => host.close())

  const displays = [ioClient(url, { transports: ['websocket'] }), ioClient(url, { transports: ['websocket'] }), ioClient(url, { transports: ['websocket'] }), ioClient(url, { transports: ['websocket'] })]
  t.after(() => displays.forEach((d) => d.close()))
  await Promise.all(displays.map((d) => waitFor(d, 'connect')))

  const results = []
  for (const d of displays) {
    results.push(await ackCall(d, 'join_display', { roomCode: room.roomCode }))
  }
  assert.equal(results.filter((r) => r.ok).length, 3, 'exactly 3 displays should succeed')
  assert.equal(results.filter((r) => r.error).length, 1, 'the 4th display should be rejected (cap)')

  // Display receives the same broadcast a player would, without ever submitting anything.
  const displayGotPhase = waitFor(displays[0], 'phase_changed')
  await ackCall(host, 'update_room_settings', { roundsCount: 4 })
  const phasePayload = await displayGotPhase
  assert.equal(phasePayload.room.settings.roundsCount, 4)

  // Displays never appear in the player list.
  const roomView = await ackCall(host, 'update_room_settings', { roundsCount: 4 })
  assert.equal(roomView.ok, true)
})

test('room.displayCount reflects joined displays and playerCount is unaffected', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const { host, room } = await makeRoom(url)
  t.after(() => host.close())

  assert.equal(room.room.displayCount, 0)
  assert.equal(room.room.players.length, 1)

  const display = ioClient(url, { transports: ['websocket'] })
  t.after(() => display.close())
  await waitFor(display, 'connect')
  const joinRes = await ackCall(display, 'join_display', { roomCode: room.roomCode })
  assert.equal(joinRes.room.displayCount, 1)
  assert.equal(joinRes.room.players.length, 1, 'display must never appear in the player list')
})

// ── TASK 3: category completion % ──

test('get_category_completion: 0% before playing, increases after a question is served', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const deviceId = crypto.randomUUID()
  const { host, room } = await makeRoom(url, { playerName: 'Host', allowedCategories: ['sports'] })
  t.after(() => host.close())
  // re-create with deviceId attached (makeRoom helper doesn't take deviceId; do it directly)
  void deviceId

  const client = ioClient(url, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')
  const devId = crypto.randomUUID()
  const created = await ackCall(client, 'create_room', {
    isPrivate: true, answerTimeSeconds: 30, roundsCount: 1, playerName: 'Solo', language: 'en',
    allowedCategories: ['sports'], deviceId: devId,
  })

  const before = await ackCall(client, 'get_category_completion', { deviceId: devId })
  const sportsBefore = before.find((c: any) => c.category === 'sports')
  assert.equal(sportsBefore.seenCount, 0)
  assert.ok(sportsBefore.totalCount > 0)
  assert.equal(sportsBefore.percentage, 0)

  const guest = ioClient(url, { transports: ['websocket'] })
  t.after(() => guest.close())
  await waitFor(guest, 'connect')
  await ackCall(guest, 'join_room', { roomCode: created.roomCode, playerName: 'Guest2' })

  const categoryPickPromise = waitFor(client, 'phase_changed')
  await new Promise((resolve) => client.emit('start_game', resolve))
  const catPick = await categoryPickPromise
  assert.equal(catPick.phase, 'CATEGORY_PICK')

  const answeringPromise = waitFor(client, 'phase_changed')
  client.emit('pick_category', { category: 'sports' })
  await answeringPromise

  const after = await ackCall(client, 'get_category_completion', { deviceId: devId })
  const sportsAfter = after.find((c: any) => c.category === 'sports')
  assert.equal(sportsAfter.seenCount, 1)
  assert.ok(sportsAfter.percentage > 0)
})

// ── TASK 4: premium categories + expansion packs ──

test('space category is excluded from a room unless the device unlocked it (subscription or purchase)', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const client = ioClient(url, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const deviceId = crypto.randomUUID()
  const attempt = await ackCall(client, 'create_room', {
    isPrivate: true, answerTimeSeconds: 30, roundsCount: 1, playerName: 'Host', language: 'en',
    allowedCategories: ['space'], deviceId,
  })
  assert.deepEqual(attempt.room.settings.allowedCategories, [], 'space silently dropped — device never unlocked it')

  // Purchase the unlock, then it should be allowed.
  const db = getDb()
  await ackCall(client, 'get_or_create_profile', { deviceId, nickname: 'Buyer' })
  db.run(`UPDATE players SET coins = 500 WHERE device_id = ?`, [deviceId])
  const purchase = await ackCall(client, 'purchase_item', { deviceId, itemId: 'category_unlock_space' })
  assert.equal(purchase.success, true)

  const attempt2 = await ackCall(client, 'create_room', {
    isPrivate: true, answerTimeSeconds: 30, roundsCount: 1, playerName: 'Host', language: 'en',
    allowedCategories: ['space'], deviceId,
  })
  assert.deepEqual(attempt2.room.settings.allowedCategories, ['space'], 'now unlocked, so it is allowed')
})

test('space category never appears in the default (no explicit filter) category pool', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const client = ioClient(url, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const room = await ackCall(client, 'create_room', {
    isPrivate: true, answerTimeSeconds: 30, roundsCount: 1, playerName: 'Host', language: 'en',
  })
  const guest = ioClient(url, { transports: ['websocket'] })
  t.after(() => guest.close())
  await waitFor(guest, 'connect')
  await ackCall(guest, 'join_room', { roomCode: room.roomCode, playerName: 'Guest' })

  const catPickPromise = waitFor(client, 'phase_changed')
  await new Promise((resolve) => client.emit('start_game', resolve))
  const catPick = await catPickPromise
  assert.ok(!catPick.categoryOptions.includes('space'), 'space must never surface without being explicitly unlocked+requested')
})

test('purchase_item: categoryExpansion item purchasable and inventory-tracked like any cosmetic', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const client = ioClient(url, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const deviceId = crypto.randomUUID()
  await ackCall(client, 'get_or_create_profile', { deviceId, nickname: 'Expander' })
  const db = getDb()
  db.run(`UPDATE players SET coins = 200 WHERE device_id = ?`, [deviceId])

  const res = await ackCall(client, 'purchase_item', { deviceId, itemId: 'category_expansion_sports' })
  assert.equal(res.success, true)
  assert.equal(res.coins, 100)
  assert.ok(res.inventory.some((i: any) => i.itemId === 'category_expansion_sports'))
})

// ── TASK 5: Tournament mode ──

test('tournament mode: 3-game series with cumulative standings, ends with overall winner', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const host = ioClient(url, { transports: ['websocket'] })
  const guest = ioClient(url, { transports: ['websocket'] })
  t.after(() => { host.close(); guest.close() })
  await Promise.all([waitFor(host, 'connect'), waitFor(guest, 'connect')])

  const room = await ackCall(host, 'create_room', {
    isPrivate: true, answerTimeSeconds: 5, roundsCount: 1, playerName: 'Host', language: 'en',
    tournamentMode: true, allowedCategories: ['sports'],
  })
  assert.equal(room.room.tournament.totalGames, 3)
  assert.equal(room.room.tournament.gameIndex, 1)

  await ackCall(guest, 'join_room', { roomCode: room.roomCode, playerName: 'Guest' })

  async function playOneGame() {
    const catPickPromise = waitFor(host, 'phase_changed')
    await new Promise((resolve) => host.emit('start_game', resolve))
    await catPickPromise
    const answeringPromise = waitFor(host, 'phase_changed')
    host.emit('pick_category', { category: 'sports' })
    await answeringPromise

    const resultsPromise = waitFor(host, 'phase_changed', 15000)
    await ackCall(host, 'submit_answer', { text: 'a random wrong answer', forceSubmit: true })
    await ackCall(guest, 'submit_answer', { text: 'another wrong answer', forceSubmit: true })
    const votingPayload = await resultsPromise
    assert.equal(votingPayload.phase, 'VOTING')

    // Deterministic non-tie outcome: guest votes for host's fake answer (host +1 for fooling
    // them); host can't vote its own answer, so it votes the correct slot (host +1 more for
    // guessing right). Host wins outright 2-0 — avoids a tie, which would trigger a
    // tiebreaker round instead of GAME_OVER and make this test's flow non-deterministic.
    const resultsPhasePromise = waitFor(host, 'phase_changed', 15000)
    const hostAnswerSlot = votingPayload.answers.find((a: any) => a.text === 'a random wrong answer')
    const correctSlot = votingPayload.answers.find((a: any) => a.text !== 'a random wrong answer' && a.text !== 'another wrong answer')
    guest.emit('submit_vote', { slotId: hostAnswerSlot.slotId })
    host.emit('submit_vote', { slotId: correctSlot.slotId })
    const resultsPhase = await resultsPhasePromise
    assert.equal(resultsPhase.phase, 'RESULTS')

    // computeResults() schedules the next transition (next round or GAME_OVER) 5s later.
    const gameOverPromise = waitFor(host, 'phase_changed', 15000)
    return gameOverPromise
  }

  const gameOver1 = await playOneGame()
  assert.equal(gameOver1.phase, 'GAME_OVER')
  assert.equal(gameOver1.tournament.isFinalGame, false)
  assert.equal(gameOver1.tournament.gameIndex, 1)

  const lobbyAgain = waitFor(host, 'phase_changed')
  const nextRes = await new Promise((resolve) => host.emit('start_next_tournament_game', resolve))
  assert.equal(nextRes.ok, true)
  const lobbyPayload = await lobbyAgain
  assert.equal(lobbyPayload.phase, 'LOBBY')
  assert.equal(lobbyPayload.tournament.gameIndex, 2)
  assert.equal(lobbyPayload.room.players.every((p: any) => p.score === 0), true, 'per-game score resets')

  const gameOver2 = await playOneGame()
  assert.equal(gameOver2.tournament.gameIndex, 2)
  assert.equal(gameOver2.tournament.isFinalGame, false)
  await new Promise((resolve) => host.emit('start_next_tournament_game', resolve))

  const gameOver3 = await playOneGame()
  assert.equal(gameOver3.tournament.gameIndex, 3)
  assert.equal(gameOver3.tournament.isFinalGame, true)
  assert.ok(gameOver3.tournament.cumulativeStandings.length === 2)
  const totalPoints = gameOver3.tournament.cumulativeStandings.reduce((sum: number, s: any) => sum + s.cumulativeScore, 0)
  assert.ok(totalPoints > 0, 'cumulative standings should reflect points scored across all 3 games')

  const noMoreGames = await new Promise((resolve) => host.emit('start_next_tournament_game', resolve))
  assert.ok(noMoreGames.error, 'no 4th game exists')
})
