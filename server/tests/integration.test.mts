import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { io as ioClient, type Socket as ClientSocket } from 'socket.io-client'

process.env.DB_PATH = path.join(os.tmpdir(), `kalak-test-${crypto.randomUUID()}.sqlite`)
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

test('full round: create -> join -> answer -> vote -> scoring -> GAME_OVER', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())

  const url = `http://localhost:${port}`
  const host = ioClient(url, { transports: ['websocket'] })
  const p2 = ioClient(url, { transports: ['websocket'] })
  const p3 = ioClient(url, { transports: ['websocket'] })
  t.after(() => {
    host.close()
    p2.close()
    p3.close()
  })

  await Promise.all([waitFor(host, 'connect'), waitFor(p2, 'connect'), waitFor(p3, 'connect')])

  const created = await ackCall(host, 'create_room', {
    playerName: 'Host',
    isPrivate: false,
    answerTimeSeconds: 10,
    roundsCount: 1,
    allowedCategories: [],
  })
  assert.equal(created.roomCode.length, 4)
  assert.match(created.joinUrl, /\/join\/[A-Z0-9]{4}$/)
  assert.match(created.qrCodeDataUrl, /^data:image\/png;base64,/)

  const joined2 = await ackCall(p2, 'join_room', { roomCode: created.roomCode, playerName: 'P2' })
  const joined3 = await ackCall(p3, 'join_room', { roomCode: created.roomCode, playerName: 'P3' })
  assert.ok(joined2.playerId)
  assert.ok(joined3.playerId)

  const categoryPickWaits = [
    waitFor(host, 'phase_changed'),
    waitFor(p2, 'phase_changed'),
    waitFor(p3, 'phase_changed'),
  ]
  host.emit('start_game')
  const [categoryPick] = await Promise.all(categoryPickWaits)
  assert.equal(categoryPick.phase, 'CATEGORY_PICK')
  assert.ok(categoryPick.categoryOptions.length > 0)

  const answeringWaits = [
    waitFor(host, 'phase_changed'),
    waitFor(p2, 'phase_changed'),
    waitFor(p3, 'phase_changed'),
  ]
  host.emit('pick_category', { category: categoryPick.categoryOptions[0] })
  const [answeringHost, answeringP2, answeringP3] = await Promise.all(answeringWaits)
  assert.equal(answeringHost.phase, 'ANSWERING')
  // The correct answer must never be leaked to clients during ANSWERING.
  assert.equal(answeringHost.question.answer, undefined)
  assert.equal(answeringP2.question.answer, undefined)
  assert.equal(answeringP3.question.answer, undefined)

  const votingPromise = waitFor(host, 'phase_changed')
  host.emit('submit_answer', { text: 'HOST_FAKE' })
  p2.emit('submit_answer', { text: 'P2_FAKE' })
  p3.emit('submit_answer', { text: 'P3_FAKE' })
  const voting = await votingPromise
  assert.equal(voting.phase, 'VOTING')
  assert.equal(voting.answers.length, 4) // 3 fake + 1 correct

  const correctSlot = voting.answers.find(
    (a: any) => !['HOST_FAKE', 'P2_FAKE', 'P3_FAKE'].includes(a.text)
  )
  const hostFakeSlot = voting.answers.find((a: any) => a.text === 'HOST_FAKE')
  assert.ok(correctSlot)
  assert.ok(hostFakeSlot)

  const resultsPromise = waitFor(host, 'phase_changed', 15000)
  host.emit('submit_vote', { slotId: correctSlot.slotId }) // host guesses correctly: +1
  p2.emit('submit_vote', { slotId: hostFakeSlot.slotId }) // fooled by host: host +1
  p3.emit('submit_vote', { slotId: hostFakeSlot.slotId }) // fooled by host: host +1
  const results = await resultsPromise
  assert.equal(results.phase, 'RESULTS')

  const hostScore = results.room.players.find((p: any) => p.name === 'Host').score
  const p2Score = results.room.players.find((p: any) => p.name === 'P2').score
  const p3Score = results.room.players.find((p: any) => p.name === 'P3').score
  assert.equal(hostScore, 3) // 1 (correct guess) + 2 (fooled p2 and p3)
  assert.equal(p2Score, 0)
  assert.equal(p3Score, 0)

  const gameOver = await waitFor(host, 'phase_changed', 15000)
  assert.equal(gameOver.phase, 'GAME_OVER')
  assert.equal(gameOver.finalStandings[0].name, 'Host')
  assert.equal(gameOver.finalStandings[0].score, 3)
})

test('reconnect within window restores the player; past the window removes them', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())

  const url = `http://localhost:${port}`
  const host = ioClient(url, { transports: ['websocket'] })
  let flaky = ioClient(url, { transports: ['websocket'] })
  t.after(() => {
    host.close()
    flaky.close()
  })

  await Promise.all([waitFor(host, 'connect'), waitFor(flaky, 'connect')])

  const created = await ackCall(host, 'create_room', {
    playerName: 'Host',
    isPrivate: false,
    answerTimeSeconds: 60,
    roundsCount: 3,
    allowedCategories: [],
  })
  const joined = await ackCall(flaky, 'join_room', { roomCode: created.roomCode, playerName: 'Flaky' })
  const flakyPlayerId = joined.playerId

  host.emit('start_game')
  await waitFor(host, 'phase_changed') // CATEGORY_PICK

  // Disconnect mid-game (non-LOBBY phase uses the grace-period path, not instant removal).
  const disconnectSeen = waitFor(host, 'player_disconnected')
  flaky.close()
  const disconnectedPayload = await disconnectSeen
  assert.equal(disconnectedPayload.playerId, flakyPlayerId)

  // Reconnect quickly with the same playerId: should be restored, not treated as a new player.
  const freshSocket = ioClient(url, { transports: ['websocket'] })
  t.after(() => freshSocket.close())
  await waitFor(freshSocket, 'connect')
  const rejoin = await ackCall(freshSocket, 'join_room', {
    roomCode: created.roomCode,
    playerId: flakyPlayerId,
  })
  assert.equal(rejoin.reconnected, true)
  assert.equal(rejoin.playerId, flakyPlayerId)

  // Now let it drop and expire past the (300ms, test-configured) reconnect window.
  const playerLeftPromise = waitFor(host, 'player_left', 3000)
  freshSocket.close()
  const left = await playerLeftPromise
  assert.equal(left.playerId, flakyPlayerId)
  assert.equal(left.room.players.some((p: any) => p.id === flakyPlayerId), false)
})

test('double-points round, blind voting, and most-deceptive-player aggregation', async (t) => {
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

  // roundsCount: 1 makes the (randomly-chosen) double-points round deterministic — it can only be round 1.
  const created = await ackCall(host, 'create_room', {
    playerName: 'Host',
    isPrivate: false,
    answerTimeSeconds: 10,
    roundsCount: 1,
    allowedCategories: [],
    doublePointsRoundEnabled: true,
    blindVotingEnabled: true,
  })
  await ackCall(p2, 'join_room', { roomCode: created.roomCode, playerName: 'P2' })

  const catWaits = [waitFor(host, 'phase_changed'), waitFor(p2, 'phase_changed')]
  host.emit('start_game')
  const [catPick] = await Promise.all(catWaits)

  const ansWaits = [waitFor(host, 'phase_changed'), waitFor(p2, 'phase_changed')]
  host.emit('pick_category', { category: catPick.categoryOptions[0] })
  const [ansHost] = await Promise.all(ansWaits)
  assert.equal(ansHost.isDoublePointsRound, true)

  const votingPromise = waitFor(host, 'phase_changed')
  host.emit('submit_answer', { text: 'HOST_FAKE' })
  p2.emit('submit_answer', { text: 'P2_FAKE' })
  const voting = await votingPromise
  const correctSlot = voting.answers.find((a: any) => !['HOST_FAKE', 'P2_FAKE'].includes(a.text))

  const resultsPromise = waitFor(host, 'phase_changed', 15000)
  host.emit('submit_vote', { slotId: correctSlot.slotId }) // host guesses correctly
  p2.emit('submit_vote', { slotId: voting.answers.find((a: any) => a.text === 'HOST_FAKE').slotId }) // p2 fooled by host
  const results = await resultsPromise

  assert.equal(results.results.wasDoublePoints, true)
  // Blind voting: per-answer vote counts must not be leaked to clients.
  for (const a of results.results.answers) {
    assert.equal(a.votesReceived, undefined)
    assert.equal(a.pointsAwarded, undefined)
  }
  const hostScore = results.room.players.find((p: any) => p.name === 'Host').score
  assert.equal(hostScore, 4) // (1 correct-guess + 1 fooled-p2) * 2 multiplier

  const gameOver = await waitFor(host, 'phase_changed', 15000)
  assert.equal(gameOver.phase, 'GAME_OVER')
  assert.equal(gameOver.mostDeceptivePlayer.name, 'Host')
  assert.equal(gameOver.mostDeceptivePlayer.timesFooledOthers, 1)
})

test('family mode filters out adult-rated questions', async () => {
  const { pickQuestion } = await import('../src/game/questionBank.mts')
  for (let i = 0; i < 200; i++) {
    const q = pickQuestion('general', true)
    assert.equal(q.ageRating, 'family')
  }
  const ratings = new Set<string>()
  for (let i = 0; i < 200; i++) {
    ratings.add(pickQuestion('general', false).ageRating)
  }
  assert.ok(ratings.has('family'))
})
