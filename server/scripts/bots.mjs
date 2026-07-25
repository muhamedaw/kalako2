// Joins N bot players into an existing room and auto-plays (random fake answers,
// random votes for a non-own slot) so a human host can test/play solo.
// Usage: node scripts/bots.mjs <ROOM_CODE> [count] [url]
import { io } from 'socket.io-client'

const ROOM_CODE = process.argv[2]
const COUNT = Number(process.argv[3]) || 3
const URL = process.argv[4] || 'https://kalak-16-16-218-187.sslip.io'

if (!ROOM_CODE) {
  console.error('Usage: node scripts/bots.mjs <ROOM_CODE> [count] [url]')
  process.exit(1)
}

const FAKE_ANSWERS = [
  '42', 'لا أحد يعرف', 'إبراهيم لينكولن', 'شيء غريب جدًا', 'الفهد',
  'باريس بالطبع', 'شيء لا يخطر على بال', '17', 'مستحيل', 'قطعًا لا',
]

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function makeBot(name) {
  const socket = io(URL, { transports: ['websocket'] })
  let mySlotId = null

  socket.on('connect', () => {
    socket.emit('join_room', { roomCode: ROOM_CODE, playerName: name }, (res) => {
      if (res?.error) {
        console.error(`[${name}] join failed: ${res.error}`)
      } else {
        console.log(`[${name}] joined room ${ROOM_CODE}`)
      }
    })
  })

  socket.on('your_answer_slot', ({ slotId }) => {
    mySlotId = slotId
  })

  socket.on('phase_changed', (data) => {
    if (data.phase === 'ANSWERING') {
      mySlotId = null
      const delay = 800 + Math.random() * 2500
      setTimeout(() => {
        socket.emit('submit_answer', { text: randomFrom(FAKE_ANSWERS) })
        console.log(`[${name}] answered`)
      }, delay)
    } else if (data.phase === 'VOTING') {
      const delay = 800 + Math.random() * 2500
      setTimeout(() => {
        const options = (data.answers || []).filter((a) => a.slotId !== mySlotId)
        if (options.length === 0) return
        const pick = randomFrom(options)
        socket.emit('submit_vote', { slotId: pick.slotId })
        console.log(`[${name}] voted`)
      }, delay)
    }
  })

  socket.on('disconnect', () => console.log(`[${name}] disconnected`))
  return socket
}

console.log(`Connecting ${COUNT} bots to room ${ROOM_CODE} at ${URL} ...`)
const bots = Array.from({ length: COUNT }, (_, i) => makeBot(`Bot${i + 1}`))

process.on('SIGINT', () => {
  bots.forEach((b) => b.close())
  process.exit(0)
})
