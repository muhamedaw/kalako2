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
import type { RoomSettings, RoomState } from '../game/types.mts'

interface CreateRoomPayload {
  playerName?: string
  isPrivate?: boolean
  answerTimeSeconds?: number
  roundsCount?: number
  allowedCategories?: string[]
  familyMode?: boolean
  doublePointsRoundEnabled?: boolean
  blindVotingEnabled?: boolean
}

interface JoinRoomPayload {
  roomCode?: string
  playerName?: string
  playerId?: string
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
    socket.on('create_room', async (payload: CreateRoomPayload = {}, ack?: Ack<any>) => {
      const settings = validateSettings(payload)
      if ('error' in settings) return ack?.({ error: settings.error })

      const name = (payload.playerName || '').trim().slice(0, 24) || 'المضيف'
      const { room, host } = createRoom(settings, name)
      host.socketId = socket.id
      socket.data.playerId = host.id
      socket.join(room.code)

      const joinUrl = `${config.joinBaseUrl}/join/${room.code}`
      const qrCodeDataUrl = await makeQrCodeDataUrl(joinUrl)

      ack?.({ roomCode: room.code, joinUrl, qrCodeDataUrl, playerId: host.id, room: publicRoomView(room) })
    })

    socket.on('join_room', (payload: JoinRoomPayload = {}, ack?: Ack<any>) => {
      const code = (payload.roomCode || '').trim().toUpperCase()
      const room = getRoom(code)
      if (!room) return ack?.({ error: 'الغرفة غير موجودة' })

      // Reconnect path: known playerId already seated in this room.
      if (payload.playerId && room.players.has(payload.playerId)) {
        const player = room.players.get(payload.playerId)!
        if (player.disconnectTimer) {
          clearTimeout(player.disconnectTimer)
          player.disconnectTimer = null
        }
        player.connected = true
        player.socketId = socket.id
        socket.data.playerId = player.id
        socket.join(room.code)

        ack?.({ playerId: player.id, room: publicRoomView(room), reconnected: true })
        io.to(room.code).emit('player_reconnected', { playerId: player.id, room: publicRoomView(room) })
        return
      }

      if (room.phase !== 'LOBBY') {
        return ack?.({ error: 'اللعبة بدأت بالفعل، لا يمكن الانضمام الآن' })
      }

      const name = (payload.playerName || '').trim().slice(0, 24)
      if (!name) return ack?.({ error: 'اسم اللاعب مطلوب' })

      const result = addPlayer(room, name)
      if ('error' in result) return ack?.({ error: result.error })

      result.socketId = socket.id
      socket.data.playerId = result.id
      socket.join(room.code)

      ack?.({ playerId: result.id, room: publicRoomView(room) })
      io.to(room.code).emit('player_joined', { player: { id: result.id, name: result.name }, room: publicRoomView(room) })
    })

    socket.on('start_game', () => {
      const room = currentRoom(socket)
      if (!room || room.phase !== 'LOBBY') return
      if (!requireHost(room, socket)) return
      if (connectedPlayers(room).length < config.minPlayers) return
      startRound(io, room)
    })

    socket.on('pick_category', (payload: { category?: string } = {}) => {
      const room = currentRoom(socket)
      if (!room || room.phase !== 'CATEGORY_PICK') return
      if (!requireHost(room, socket)) return
      if (!payload.category || !room.categoryOptions.includes(payload.category)) return
      beginAnswering(io, room, payload.category)
    })

    socket.on('submit_answer', (payload: { text?: string } = {}) => {
      const room = currentRoom(socket)
      const playerId = socket.data.playerId as string | undefined
      if (!room || !playerId || room.phase !== 'ANSWERING') return
      const text = (payload.text || '').trim().slice(0, 140)
      if (!text) return

      room.answers.set(playerId, { playerId, text })
      io.to(room.code).emit('answer_progress', {
        answeredCount: room.answers.size,
        totalPlayers: connectedPlayers(room).length,
      })
      maybeAllAnswered(io, room)
    })

    socket.on('submit_vote', (payload: { slotId?: string } = {}) => {
      const room = currentRoom(socket)
      const playerId = socket.data.playerId as string | undefined
      if (!room || !playerId || room.phase !== 'VOTING') return
      if (room.votes.has(playerId)) return // one vote per player
      const slotId = payload.slotId || ''
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

    socket.on('leave_room', () => handleDisconnect(io, socket))
    socket.on('disconnect', () => handleDisconnect(io, socket))
  })
}

function handleDisconnect(io: Server, socket: Socket) {
  const playerId = socket.data.playerId as string | undefined
  if (!playerId) return
  const room = getRoomByPlayerId(playerId)
  if (!room) return

  const player = room.players.get(playerId)
  if (!player || player.socketId !== socket.id) return // stale event from a superseded socket

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
