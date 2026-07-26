import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { io as ioClient, type Socket as ClientSocket } from 'socket.io-client'

process.env.DB_PATH = path.join(os.tmpdir(), `kalak-test-extra-${crypto.randomUUID()}.sqlite`)
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

test('tiebreaker: two players tied at game end enter a tiebreaker round, not GAME_OVER', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const host = ioClient(url, { transports: ['websocket'] })
  const p2 = ioClient(url, { transports: ['websocket'] })
  t.after(() => { host.close(); p2.close() })
  await Promise.all([waitFor(host, 'connect'), waitFor(p2, 'connect')])

  const created = await ackCall(host, 'create_room', {
    playerName: 'Host', isPrivate: false, answerTimeSeconds: 10, roundsCount: 1, allowedCategories: [],
  })
  await ackCall(p2, 'join_room', { roomCode: created.roomCode, playerName: 'P2' })

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

  // Both players vote CORRECT (neither falls for the other's fake) -> both score exactly 1 -> tied.
  const resultsPromise = waitFor(host, 'phase_changed', 15000)
  host.emit('submit_vote', { slotId: correctSlot.slotId })
  p2.emit('submit_vote', { slotId: correctSlot.slotId })
  const results = await resultsPromise
  assert.equal(results.phase, 'RESULTS')
  const hostScore = results.room.players.find((p: any) => p.name === 'Host').score
  const p2Score = results.room.players.find((p: any) => p.name === 'P2').score
  assert.equal(hostScore, 1)
  assert.equal(p2Score, 1)

  // roundsCount was 1, so the next transition must be a tiebreaker, not GAME_OVER.
  const afterResults = await waitFor(host, 'phase_changed', 15000)
  assert.equal(afterResults.tiebreaker, true)
  assert.equal(afterResults.room.isTiebreakerRound, true)
  assert.notEqual(afterResults.phase, 'GAME_OVER')
  assert.ok(afterResults.categoryOptions.length > 0)
})

test('room lifecycle: host disconnecting in LOBBY hands hostId to the next connected player', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const url = `http://localhost:${port}`
  const host = ioClient(url, { transports: ['websocket'] })
  const p2 = ioClient(url, { transports: ['websocket'] })
  t.after(() => { host.close(); p2.close() })
  await Promise.all([waitFor(host, 'connect'), waitFor(p2, 'connect')])

  const created = await ackCall(host, 'create_room', {
    playerName: 'Host', isPrivate: false, answerTimeSeconds: 10, roundsCount: 1, allowedCategories: [],
  })
  const joined = await ackCall(p2, 'join_room', { roomCode: created.roomCode, playerName: 'P2' })

  const playerLeftPromise = waitFor(p2, 'player_left', 3000)
  host.close() // still in LOBBY -> immediate removal + reassignment, no grace period
  const left = await playerLeftPromise

  assert.equal(left.room.hostId, joined.playerId)
  const p2InRoom = left.room.players.find((p: any) => p.id === joined.playerId)
  assert.equal(p2InRoom.isHost, true)
  assert.equal(left.room.players.some((p: any) => p.name === 'Host'), false)
})

test('update_profile: a custom avatarConfig persists and round-trips through get_or_create_profile', async (t) => {
  const { httpServer, port } = await startServer()
  t.after(() => httpServer.close())
  const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] })
  t.after(() => client.close())
  await waitFor(client, 'connect')

  const deviceId = crypto.randomUUID()
  const initial = await ackCall(client, 'get_or_create_profile', { deviceId, nickname: 'Stylish' })
  assert.ok(initial.avatarConfig && typeof initial.avatarConfig === 'object')

  const customConfig = { body: 'body_3', eyes: 'eyes_5', hat: 'hat_2' }
  const updated = await ackCall(client, 'update_profile', { deviceId, avatarConfig: customConfig })
  assert.deepEqual(updated.avatarConfig, customConfig)

  const reread = await ackCall(client, 'get_or_create_profile', { deviceId })
  assert.deepEqual(reread.avatarConfig, customConfig)
})
