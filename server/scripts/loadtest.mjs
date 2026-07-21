// 20-player load test: create a room, join 19 more players, play one full round,
// and report timing for each phase transition. Not part of the CI test suite —
// run manually: node scripts/loadtest.mjs [url]
import { io } from 'socket.io-client'

const URL = process.argv[2] || 'http://localhost:4001'
const PLAYER_COUNT = 20

function waitFor(socket, event, ms = 15000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout waiting for "${event}"`)), ms)
    socket.once(event, (payload) => {
      clearTimeout(t)
      resolve(payload)
    })
  })
}
function ackCall(socket, event, payload) {
  return new Promise((resolve) => socket.emit(event, payload, resolve))
}

async function main() {
  const t0 = Date.now()
  const sockets = Array.from({ length: PLAYER_COUNT }, () => io(URL, { transports: ['websocket'] }))
  const [host, ...guests] = sockets

  await Promise.all(sockets.map((s) => waitFor(s, 'connect')))
  console.log(`[connect] ${PLAYER_COUNT} sockets connected in ${Date.now() - t0}ms`)

  const tCreate = Date.now()
  const created = await ackCall(host, 'create_room', {
    playerName: 'Host',
    isPrivate: false,
    answerTimeSeconds: 20,
    roundsCount: 1,
    allowedCategories: [],
  })
  console.log(`[create_room] roomCode=${created.roomCode} in ${Date.now() - tCreate}ms`)

  const tJoin = Date.now()
  await Promise.all(
    guests.map((s, i) => ackCall(s, 'join_room', { roomCode: created.roomCode, playerName: `P${i + 2}` }))
  )
  console.log(`[join_room] ${guests.length} players joined in ${Date.now() - tJoin}ms`)

  const tStart = Date.now()
  const catWaits = sockets.map((s) => waitFor(s, 'phase_changed'))
  host.emit('start_game')
  const [catPick] = await Promise.all(catWaits)
  console.log(`[CATEGORY_PICK] broadcast to ${PLAYER_COUNT} sockets in ${Date.now() - tStart}ms`)

  const tAnswering = Date.now()
  const ansWaits = sockets.map((s) => waitFor(s, 'phase_changed'))
  host.emit('pick_category', { category: catPick.categoryOptions[0] })
  await Promise.all(ansWaits)
  console.log(`[ANSWERING] broadcast to ${PLAYER_COUNT} sockets in ${Date.now() - tAnswering}ms`)

  const tAnswer = Date.now()
  const votingP = waitFor(host, 'phase_changed')
  sockets.forEach((s, i) => s.emit('submit_answer', { text: `FAKE_${i}` }))
  const voting = await votingP
  console.log(`[submit_answer x${PLAYER_COUNT} -> VOTING] in ${Date.now() - tAnswer}ms`)

  const tVote = Date.now()
  const resultsP = waitFor(host, 'phase_changed', 20000)
  sockets.forEach((s, i) => {
    const notOwn = voting.answers.find((a) => a.text !== `FAKE_${i}`)
    s.emit('submit_vote', { slotId: notOwn.slotId })
  })
  const results = await resultsP
  console.log(`[submit_vote x${PLAYER_COUNT} -> RESULTS] in ${Date.now() - tVote}ms`)
  console.log(`[total] full round with ${PLAYER_COUNT} players in ${Date.now() - t0}ms`)
  console.log('phase:', results.phase, 'players scored:', results.room.players.length)

  sockets.forEach((s) => s.close())
  process.exit(0)
}

main().catch((err) => {
  console.error('LOAD TEST FAILED:', err)
  process.exit(1)
})
