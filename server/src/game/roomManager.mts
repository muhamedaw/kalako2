import crypto from 'node:crypto'
import { generateRoomCode } from './roomCode.mts'
import { config } from '../config.mts'
import type { Player, RoomSettings, RoomState } from './types.mts'

const rooms = new Map<string, RoomState>()
// playerId -> roomCode, so a reconnecting socket can find its room without scanning everything.
const playerIndex = new Map<string, string>()

export const MAX_DISPLAYS_PER_ROOM = 3
export const TOURNAMENT_TOTAL_GAMES = 3

export function getRoom(code: string): RoomState | undefined {
  return rooms.get(code.toUpperCase())
}

export function getRoomByPlayerId(playerId: string): RoomState | undefined {
  const code = playerIndex.get(playerId)
  return code ? rooms.get(code) : undefined
}

export function createRoom(
  settings: RoomSettings,
  hostName: string,
  deviceId: string | null = null
): { room: RoomState; host: Player } {
  let code = generateRoomCode()
  while (rooms.has(code)) code = generateRoomCode()

  const host: Player = {
    id: crypto.randomUUID(),
    socketId: null,
    name: hostName,
    score: 0,
    isHost: true,
    isPremium: false,
    connected: true,
    disconnectTimer: null,
    deviceId,
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
    correctGuessCounts: new Map(),
    displays: new Map(),
    tournament: settings.tournamentMode
      ? { gameIndex: 1, totalGames: TOURNAMENT_TOTAL_GAMES, cumulativeScores: new Map() }
      : null,
  }

  rooms.set(code, room)
  playerIndex.set(host.id, code)
  return { room, host }
}

export function addPlayer(
  room: RoomState,
  name: string,
  deviceId: string | null = null
): Player | { error: string } {
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
    isPremium: false,
    connected: true,
    disconnectTimer: null,
    deviceId,
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

/** Returns 'ok', or 'full' if the room already has MAX_DISPLAYS_PER_ROOM watchers. Never
 * counted toward playerCount or the round-count recommendation — displays are pure spectators. */
export function addDisplay(room: RoomState, socketId: string): 'ok' | 'full' {
  if (room.displays.size >= MAX_DISPLAYS_PER_ROOM) return 'full'
  room.displays.set(socketId, { socketId })
  return 'ok'
}

export function removeDisplay(room: RoomState, socketId: string) {
  room.displays.delete(socketId)
}

/** Resets a room's per-game state (scores, round, history, current question) for the next
 * game in a tournament series, keeping the same code/players/settings. Folds the just-finished
 * game's scores into the tournament's cumulative total before zeroing them for the next game. */
export function resetRoomForNextTournamentGame(room: RoomState) {
  if (!room.tournament) return
  for (const player of room.players.values()) {
    const prevCumulative = room.tournament.cumulativeScores.get(player.id) ?? 0
    room.tournament.cumulativeScores.set(player.id, prevCumulative + player.score)
    player.score = 0
  }
  room.tournament.gameIndex += 1
  room.round = 0
  room.phase = 'LOBBY'
  room.isTiebreakerRound = false
  room.tiebreakerAttempt = 0
  room.categoryOptions = []
  room.currentQuestion = null
  room.answers.clear()
  room.votes.clear()
  room.voteSlots.clear()
  room.history = []
  room.correctGuessCounts.clear()
  room.doublePointsRound = room.settings.doublePointsRoundEnabled
    ? crypto.randomInt(1, room.settings.roundsCount + 1)
    : null
}
