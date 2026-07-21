import crypto from 'node:crypto'
import { generateRoomCode } from './roomCode.mts'
import { config } from '../config.mts'
import type { Player, RoomSettings, RoomState } from './types.mts'

const rooms = new Map<string, RoomState>()
// playerId -> roomCode, so a reconnecting socket can find its room without scanning everything.
const playerIndex = new Map<string, string>()

export function getRoom(code: string): RoomState | undefined {
  return rooms.get(code.toUpperCase())
}

export function getRoomByPlayerId(playerId: string): RoomState | undefined {
  const code = playerIndex.get(playerId)
  return code ? rooms.get(code) : undefined
}

export function createRoom(settings: RoomSettings, hostName: string): { room: RoomState; host: Player } {
  let code = generateRoomCode()
  while (rooms.has(code)) code = generateRoomCode()

  const host: Player = {
    id: crypto.randomUUID(),
    socketId: null,
    name: hostName,
    score: 0,
    isHost: true,
    connected: true,
    disconnectTimer: null,
  }

  const room: RoomState = {
    code,
    hostId: host.id,
    settings,
    players: new Map([[host.id, host]]),
    phase: 'LOBBY',
    round: 0,
    doublePointsRound: settings.doublePointsRoundEnabled
      ? crypto.randomInt(1, settings.roundsCount + 1)
      : null,
    isTiebreakerRound: false,
    tiebreakerAttempt: 0,
    categoryOptions: [],
    currentQuestion: null,
    answers: new Map(),
    votes: new Map(),
    voteSlots: new Map(),
    answerTimer: null,
    voteTimer: null,
    history: [],
    createdAt: Date.now(),
  }

  rooms.set(code, room)
  playerIndex.set(host.id, code)
  return { room, host }
}

export function addPlayer(room: RoomState, name: string): Player | { error: string } {
  const connectedCount = [...room.players.values()].filter((p) => p.connected).length
  if (connectedCount >= config.maxPlayers) {
    return { error: 'الغرفة ممتلئة (الحد الأقصى 20 لاعب)' }
  }

  const player: Player = {
    id: crypto.randomUUID(),
    socketId: null,
    name,
    score: 0,
    isHost: false,
    connected: true,
    disconnectTimer: null,
  }
  room.players.set(player.id, player)
  playerIndex.set(player.id, room.code)
  return player
}

export function connectedPlayers(room: RoomState): Player[] {
  return [...room.players.values()].filter((p) => p.connected)
}

export function removePlayer(room: RoomState, playerId: string) {
  room.players.delete(playerId)
  playerIndex.delete(playerId)
}

export function destroyRoom(code: string) {
  const room = rooms.get(code)
  if (room) {
    if (room.answerTimer) clearTimeout(room.answerTimer)
    if (room.voteTimer) clearTimeout(room.voteTimer)
    for (const p of room.players.values()) {
      if (p.disconnectTimer) clearTimeout(p.disconnectTimer)
      playerIndex.delete(p.id)
    }
  }
  rooms.delete(code)
}

export function reassignHost(room: RoomState): Player | undefined {
  const next = connectedPlayers(room)[0]
  if (!next) return undefined
  room.hostId = next.id
  next.isHost = true
  return next
}
