import type { Server, Socket } from 'socket.io'
import { config } from '../config.mts'
import { allCategories } from '../game/questionBank.mts'
import { makeQrCodeDataUrl } from '../game/qrcode.mts'
import {
  addPlayer,
  connectedPlayers,
  createRoom,
  destroyRoom,
  getRoom,
  getRoomByPlayerId,
  reassignHost,
  removePlayer,
} from '../game/roomManager.mts'
import {
  beginAnswering,
  maybeAllAnswered,
  maybeAllVoted,
  publicRoomView,
  startRound,
} from '../game/stateMachine.mts'
import type { Language, RoomSettings, RoomState } from '../game/types.mts'
import { isSameAnswer } from '../game/textNormalize.mts'
import { registerEconomyHandlers } from './economy.mts'
import { registerPaymentHandlers } from './payments.mts'
import { registerDebugHandlers } from './debug.mts'
import { isRateLimited } from './rateLimit.mts'
import { asObject, asString } from './validate.mts'
import { safeOn } from './wrapHandler.mts'

const SUPPORTED_LANGUAGES: Language[] = ['ar', 'en', 'he']

interface CreateRoomPayload {
  playerName?: string
  isPrivate?: boolean
  answerTimeSeconds?: number
  roundsCount?: number
  allowedCategories?: string[]
  familyMode?: boolean
  doublePointsRoundEnabled?: boolean
  blindVotingEnabled?: boolean
  language?: string
  deviceId?: string
}

interface JoinRoomPayload {
  roomCode?: string
  playerName?: string
  playerId?: string
  deviceId?: string
}

type Ack<T> = (response: T) => void

function validateSettings(payload: CreateRoomPayload): RoomSettings | { error: string } {
  const answerTimeSeconds = Number(payload.answerTimeSeconds)
  const roundsCount = Number(payload.roundsCount)
  if (!Number.isInteger(answerTimeSeconds) || answerTimeSeconds < 5 || answerTimeSeconds > 300) {
    return { error: 'answerTimeSeconds يجب أن يكون بين 5 و300 ثانية' }
  }
  if (!Number.isInteger(roundsCount) || roundsCount < 1 || roundsCount > 20) {
    return { error: 'roundsCount يجب أن يكون بين 1 و20' }
  }
  const allowedCategories = Array.isArray(payload.allowedCategories)
    ? payload.allowedCategories.filter((c) => allCategories.includes(c))
    : []

  return {
    isPrivate: Boolean(payload.isPrivate),
    answerTimeSeconds,
    roundsCount,
    allowedCategories,
    familyMode: payload.familyMode !== false,
    doublePointsRoundEnabled: Boolean(payload.doublePointsRoundEnabled),
    blindVotingEnabled: Boolean(payload.blindVotingEnabled),
    language: SUPPORTED_LANGUAGES.includes(payload.language as Language) ? (payload.language as Language) : 'ar',
  }
}

function requireHost(room: RoomState, socket: Socket): boolean {
  const player = [...room.players.values()].find((p) => p.socketId === socket.id)
  return !!player && player.id === room.hostId
}

function currentRoom(socket: Socket): RoomState | undefined {
  const playerId = socket.data.playerId as string | undefined
  if (!playerId) return undefined
  return getRoomByPlayerId(playerId)
}

export function registerSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    safeOn(socket, 'create_room', async (_payload: unknown, ack?: Ack<any>) => {
      if (isRateLimited(`create_room:${socket.id}`, 5, 60_000)) return ack?.({ error: 'rate_limited' })
      const payload = asObject<CreateRoomPayload>(_payload)
      const settings = validateSettings(payload)
      if ('error' in settings) return ack?.({ error: settings.error })

      const name = (asString(payload.playerName) || '').trim().slice(0, 24) || 'المضيف'
      const deviceId = asString(payload.deviceId) || null
      const { room, host } = createRoom(settings, name, deviceId)
      host.socketId = socket.id
      socket.data.playerId = host.id
      socket.join(room.code)

      const joinUrl = `${config.joinBaseUrl}/join/${room.code}`
      const qrCodeDataUrl = await makeQrCodeDataUrl(joinUrl)

      ack?.({ roomCode: room.code, joinUrl, qrCodeDataUrl, playerId: host.id, room: publicRoomView(room) })
    })

    safeOn(socket, 'join_room', (_payload: unknown, ack?: Ack<any>) => {
      if (isRateLimited(`join_room:${socket.id}`, 10, 60_000)) return ack?.({ error: 'rate_limited' })
      const payload = asObject<JoinRoomPayload>(_payload)
      const code = (asString(payload.roomCode) || '').trim().toUpperCase()
      const room = getRoom(code)
      if (!room) return ack?.({ error: 'الغرفة غير موجودة' })

      const playerId = asString(payload.playerId)
      // Reconnect path: known playerId already seated in this room.
      if (playerId && room.players.has(playerId)) {
        const player = room.players.get(playerId)!
        if (player.disconnectTimer) {
          clearTimeout(player.disconnectTimer)
          player.disconnectTimer = null
        }
        player.connected = true
        player.socketId = socket.id
        socket.data.playerId = player.id
        socket.join(room.code)

        ack?.({ playerId: player.id, room: publicRoomView(room), reconnected: true })
        io.to(room.code).emit('player_connection_changed', { playerId: player.id, status: 'reconnected' })
        io.to(room.code).emit('player_reconnected', { playerId: player.id, room: publicRoomView(room) })
        return
      }

      if (room.phase !== 'LOBBY') {
        return ack?.({ error: 'اللعبة بدأت بالفعل، لا يمكن الانضمام الآن' })
      }

      const name = (asString(payload.playerName) || '').trim().slice(0, 24)
      if (!name) return ack?.({ error: 'اسم اللاعب مطلوب' })

      const deviceId = asString(payload.deviceId) || null
      const result = addPlayer(room, name, deviceId)
      if ('error' in result) return ack?.({ error: result.error })

      result.socketId = socket.id
      socket.data.playerId = result.id
      socket.join(room.code)

      ack?.({ playerId: result.id, room: publicRoomView(room) })
      io.to(room.code).emit('player_joined', { player: { id: result.id, name: result.name }, room: publicRoomView(room) })
    })

    safeOn(socket, 'start_game', (ack?: Ack<any>) => {
      if (isRateLimited(`start_game:${socket.id}`, 10, 10_000)) return ack?.({ error: 'rate_limited' })
      const room = currentRoom(socket)
      if (!room) return ack?.({ error: 'الغرفة غير موجودة — أعد الاتصال' })
      if (room.phase !== 'LOBBY') return ack?.({ error: 'اللعبة بدأت بالفعل' })
      if (!requireHost(room, socket)) return ack?.({ error: 'المضيف فقط يقدر يبدأ اللعبة' })
      if (connectedPlayers(room).length < config.minPlayers) {
        return ack?.({ error: `يحتاج ${config.minPlayers} لاعبين على الأقل` })
      }
      startRound(io, room)
      ack?.({ ok: true })
    })

    safeOn(socket, 'pick_category', (_payload: unknown) => {
      if (isRateLimited(`pick_category:${socket.id}`, 10, 10_000)) return
      const payload = asObject<{ category?: string }>(_payload)
      const room = currentRoom(socket)
      if (!room || room.phase !== 'CATEGORY_PICK') return
      if (!requireHost(room, socket)) return
      const category = asString(payload.category)
      if (!category || !room.categoryOptions.includes(category)) return
      beginAnswering(io, room, category)
    })

    safeOn(socket, 'submit_answer', (_payload: unknown, ack?: Ack<any>) => {
      if (isRateLimited(`submit_answer:${socket.id}`, 15, 10_000)) return ack?.({ ok: false, error: 'rate_limited' })
      const payload = asObject<{ text?: string; forceSubmit?: boolean }>(_payload)
      const room = currentRoom(socket)
      const playerId = socket.data.playerId as string | undefined
      if (!room || !playerId || room.phase !== 'ANSWERING' || !room.currentQuestion) return ack?.({ ok: false })
      const text = (asString(payload.text) || '').trim().slice(0, 140)
      if (!text) return ack?.({ ok: false })

      if (!payload.forceSubmit && isSameAnswer(text, room.currentQuestion.answer)) {
        socket.emit('answer_needs_revision', { questionId: room.currentQuestion.id })
        return ack?.({ ok: false, needsRevision: true })
      }

      room.answers.set(playerId, { playerId, text })
      ack?.({ ok: true })
      io.to(room.code).emit('answer_progress', {
        answeredCount: room.answers.size,
        totalPlayers: connectedPlayers(room).length,
      })
      maybeAllAnswered(io, room)
    })

    safeOn(socket, 'submit_vote', (_payload: unknown) => {
      if (isRateLimited(`submit_vote:${socket.id}`, 15, 10_000)) return
      const payload = asObject<{ slotId?: string }>(_payload)
      const room = currentRoom(socket)
      const playerId = socket.data.playerId as string | undefined
      if (!room || !playerId || room.phase !== 'VOTING') return
      if (room.votes.has(playerId)) return // one vote per player
      const slotId = asString(payload.slotId) || ''
      const targetPlayerId = room.voteSlots.get(slotId)
      if (!targetPlayerId) return
      if (targetPlayerId === playerId) return // can't vote your own answer

      room.votes.set(playerId, { voterId: playerId, targetPlayerId })
      io.to(room.code).emit('vote_progress', {
        votedCount: room.votes.size,
        totalPlayers: connectedPlayers(room).length,
      })
      maybeAllVoted(io, room)
    })

    safeOn(socket, 'leave_room', () => {
      if (isRateLimited(`leave_room:${socket.id}`, 10, 10_000)) return
      handleDisconnect(io, socket)
    })
    safeOn(socket, 'disconnect', () => handleDisconnect(io, socket))

    registerEconomyHandlers(io, socket)
    registerPaymentHandlers(io, socket)
    registerDebugHandlers(io, socket)

    // Test-only fault injection to verify safeOn's crash resilience end-to-end against a
    // real server. Never active unless explicitly enabled — absent from .env/.env.example,
    // so it does not exist in any real deployment.
    if (process.env.ENABLE_TEST_FAULT_HANDLER === 'true') {
      safeOn(socket, '__test_throw', () => {
        throw new Error('deliberate test fault (sync)')
      })
      safeOn(socket, '__test_reject', async () => {
        throw new Error('deliberate test fault (async)')
      })
    }
  })
}

function handleDisconnect(io: Server, socket: Socket) {
  const playerId = socket.data.playerId as string | undefined
  if (!playerId) return
  const room = getRoomByPlayerId(playerId)
  if (!room) return

  const player = room.players.get(playerId)
  if (!player || player.socketId !== socket.id) return // stale event from a superseded socket

  // Purely informational — fires in every phase, before any grace-period/removal logic,
  // and never pauses timers or blocks other players.
  io.to(room.code).emit('player_connection_changed', { playerId, status: 'disconnected' })

  if (room.phase === 'LOBBY') {
    removePlayer(room, playerId)
    if (room.players.size === 0) {
      destroyRoom(room.code)
      return
    }
    if (room.hostId === playerId) reassignHost(room)
    io.to(room.code).emit('player_left', { playerId, room: publicRoomView(room) })
    return
  }

  player.connected = false
  player.socketId = null
  io.to(room.code).emit('player_disconnected', { playerId, room: publicRoomView(room) })

  if (room.phase === 'ANSWERING') maybeAllAnswered(io, room)
  if (room.phase === 'VOTING') maybeAllVoted(io, room)

  player.disconnectTimer = setTimeout(() => {
    const stillThere = room.players.get(playerId)
    if (!stillThere || stillThere.connected) return
    removePlayer(room, playerId)
    if (room.players.size === 0) {
      destroyRoom(room.code)
      return
    }
    if (room.hostId === playerId) reassignHost(room)
    io.to(room.code).emit('player_left', { playerId, room: publicRoomView(room) })
  }, config.reconnectWindowMs)
}
