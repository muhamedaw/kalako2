import type { Server, Socket } from 'socket.io'
import { config } from '../config.mts'
import { allCategories, getCategoryTotalCounts } from '../game/questionBank.mts'
import { makeQrCodeDataUrl } from '../game/qrcode.mts'
import {
  addPlayer,
  addDisplay,
  connectedPlayers,
  createRoom,
  destroyRoom,
  getRoom,
  getRoomByPlayerId,
  reassignHost,
  removeDisplay,
  removePlayer,
  MAX_DISPLAYS_PER_ROOM,
} from '../game/roomManager.mts'
import {
  beginAnswering,
  extendAnsweringTimer,
  maybeAllAnswered,
  maybeAllVoted,
  publicRoomView,
  startNextTournamentGame,
  startRound,
  swapQuestion,
} from '../game/stateMachine.mts'
import type { Language, RoomSettings, RoomState } from '../game/types.mts'
import { isSameAnswer } from '../game/textNormalize.mts'
import { filterAccessibleCategories } from '../game/categoryAccess.mts'
import { registerEconomyHandlers } from './economy.mts'
import { registerPaymentHandlers } from './payments.mts'
import { registerPremiumHandlers } from './premium.mts'
import { registerRecoveryHandlers } from './recovery.mts'
import { registerDebugHandlers } from './debug.mts'
import { registerAdminHandlers } from './admin.mts'
import { registerReactionHandlers } from './reactions.mts'
import { registerSuggestionHandlers } from './suggestions.mts'
import { registerGiftHandlers } from './gifts.mts'
import { getDb } from '../db/index.mts'
import { isRateLimited } from './rateLimit.mts'
import { asObject, asString } from './validate.mts'
import { safeOn } from './wrapHandler.mts'

const SUPPORTED_LANGUAGES: Language[] = ['ar', 'en', 'he']

interface CreateRoomPayload {
  playerName?: string
  roomName?: string
  isPrivate?: boolean
  answerTimeSeconds?: number
  roundsCount?: number
  allowedCategories?: string[]
  familyMode?: boolean
  doublePointsRoundEnabled?: boolean
  blindVotingEnabled?: boolean
  language?: string
  deviceId?: string
  tournamentMode?: boolean
}

interface JoinRoomPayload {
  roomCode?: string
  playerName?: string
  playerId?: string
  deviceId?: string
}

type Ack<T> = (response: T) => void

function validateSettings(payload: CreateRoomPayload, deviceId: string | null): RoomSettings | { error: string } {
  const answerTimeSeconds = Number(payload.answerTimeSeconds)
  const roundsCount = Number(payload.roundsCount)
  if (!Number.isInteger(answerTimeSeconds) || answerTimeSeconds < 5 || answerTimeSeconds > 300) {
    return { error: 'answerTimeSeconds يجب أن يكون بين 5 و300 ثانية' }
  }
  if (!Number.isInteger(roundsCount) || roundsCount < 1 || roundsCount > 20) {
    return { error: 'roundsCount يجب أن يكون بين 1 و20' }
  }
  const requestedCategories = Array.isArray(payload.allowedCategories)
    ? payload.allowedCategories.filter((c) => allCategories.includes(c))
    : []
  // Premium categories (see categoryAccess.mts) are silently dropped here if the requesting
  // device hasn't unlocked them — same "silently drop what doesn't apply" pattern as the
  // unknown-category-id filter above, not a hard error.
  const allowedCategories = filterAccessibleCategories(requestedCategories, deviceId)

  return {
    isPrivate: Boolean(payload.isPrivate),
    answerTimeSeconds,
    roundsCount,
    allowedCategories,
    familyMode: payload.familyMode !== false,
    doublePointsRoundEnabled: Boolean(payload.doublePointsRoundEnabled),
    blindVotingEnabled: Boolean(payload.blindVotingEnabled),
    language: SUPPORTED_LANGUAGES.includes(payload.language as Language) ? (payload.language as Language) : 'ar',
    tournamentMode: Boolean(payload.tournamentMode),
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
      const deviceId = asString(payload.deviceId) || null
      const settings = validateSettings(payload, deviceId)
      if ('error' in settings) return ack?.({ error: settings.error })

      const name = (asString(payload.playerName) || '').trim().slice(0, 24) || 'المضيف'
      // Reuses the exact same trim+cap sanitization style as playerName above — no dedicated
      // helper exists in this codebase for name-like fields (see the other 3 call sites: join_room,
      // economy.mts's ensureProfileRow/update_profile), so this follows the established pattern
      // rather than introducing a one-off abstraction just for this field.
      const roomName = (asString(payload.roomName) || '').trim().slice(0, 30)
      const { room, host } = createRoom(settings, name, deviceId, roomName)
      host.socketId = socket.id
      socket.data.playerId = host.id
      socket.join(room.code)

      if (deviceId) {
        const premiumRows = getDb().exec(`SELECT status FROM premium_subscriptions WHERE device_id = ? AND status = 'active'`, [deviceId])
        host.isPremium = premiumRows.length > 0 && premiumRows[0].values.length > 0
      }

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

        if (player.deviceId) {
          const premiumRows = getDb().exec(`SELECT status FROM premium_subscriptions WHERE device_id = ? AND status = 'active'`, [player.deviceId])
          player.isPremium = premiumRows.length > 0 && premiumRows[0].values.length > 0
        }

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

      if (deviceId) {
        const premiumRows = getDb().exec(`SELECT status FROM premium_subscriptions WHERE device_id = ? AND status = 'active'`, [deviceId])
        result.isPremium = premiumRows.length > 0 && premiumRows[0].values.length > 0
      }

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

    // Advisory only — never auto-applied. Host taps "Use recommended" (or picks any custom
    // value) and this just updates the stored setting for the NEXT round to read; a round
    // already in progress in a non-LOBBY phase keeps its already-decided-per-round behavior.
    safeOn(socket, 'update_room_settings', (_payload: unknown, ack?: Ack<any>) => {
      if (isRateLimited(`update_room_settings:${socket.id}`, 10, 10_000)) return ack?.({ error: 'rate_limited' })
      const payload = asObject<{ roundsCount?: number }>(_payload)
      const room = currentRoom(socket)
      if (!room) return ack?.({ error: 'الغرفة غير موجودة — أعد الاتصال' })
      if (room.phase !== 'LOBBY') return ack?.({ error: 'اللعبة بدأت بالفعل' })
      if (!requireHost(room, socket)) return ack?.({ error: 'المضيف فقط يقدر يغيّر الإعدادات' })

      if (payload.roundsCount !== undefined) {
        const roundsCount = Number(payload.roundsCount)
        if (!Number.isInteger(roundsCount) || roundsCount < 1 || roundsCount > 20) {
          return ack?.({ error: 'roundsCount يجب أن يكون بين 1 و20' })
        }
        room.settings.roundsCount = roundsCount
      }

      io.to(room.code).emit('phase_changed', { phase: room.phase, room: publicRoomView(room) })
      ack?.({ ok: true })
    })

    // "Watch on TV" — a pure spectator connection. Never becomes a Player: doesn't count
    // toward playerCount, the round-count recommendation, start_game's min-player check, or
    // appear in the player list. Joins the same socket.io room so it receives every broadcast
    // (phase_changed, results, etc.) exactly like a player would, for free.
    safeOn(socket, 'join_display', (_payload: unknown, ack?: Ack<any>) => {
      if (isRateLimited(`join_display:${socket.id}`, 10, 60_000)) return ack?.({ error: 'rate_limited' })
      const payload = asObject<{ roomCode?: string }>(_payload)
      const code = (asString(payload.roomCode) || '').trim().toUpperCase()
      const room = getRoom(code)
      if (!room) return ack?.({ error: 'الغرفة غير موجودة' })

      const result = addDisplay(room, socket.id)
      if (result === 'full') return ack?.({ error: `الحد الأقصى ${MAX_DISPLAYS_PER_ROOM} شاشات عرض لكل غرفة` })

      socket.data.displayRoomCode = room.code
      socket.join(room.code)
      io.to(room.code).emit('phase_changed', { phase: room.phase, room: publicRoomView(room) })
      ack?.({ ok: true, room: publicRoomView(room) })
    })

    safeOn(socket, 'get_category_completion', (_payload: unknown, ack?: Ack<any>) => {
      const payload = asObject<{ deviceId?: string }>(_payload)
      const deviceId = asString(payload.deviceId)
      if (!deviceId) return ack?.({ error: 'deviceId required' })

      try {
        const db = getDb()
        const totals = getCategoryTotalCounts()
        const rows = db.exec(
          `SELECT category, COUNT(*) FROM player_seen_questions WHERE device_id = ? GROUP BY category`,
          [deviceId]
        )
        const seenByCategory = new Map<string, number>()
        if (rows.length > 0) {
          for (const [category, count] of rows[0].values) {
            seenByCategory.set(category as string, Number(count))
          }
        }

        const completion = Object.entries(totals).map(([category, totalCount]) => {
          const seenCount = Math.min(seenByCategory.get(category) ?? 0, totalCount)
          return {
            category,
            seenCount,
            totalCount,
            percentage: totalCount > 0 ? Math.round((seenCount / totalCount) * 100) : 0,
          }
        })

        ack?.(completion)
      } catch (err) {
        console.error('[kalak] get_category_completion failed:', err)
        ack?.({ error: 'completion_failed' })
      }
    })

    safeOn(socket, 'start_next_tournament_game', (ack?: Ack<any>) => {
      if (isRateLimited(`start_next_tournament_game:${socket.id}`, 5, 10_000)) return ack?.({ error: 'rate_limited' })
      const room = currentRoom(socket)
      if (!room) return ack?.({ error: 'الغرفة غير موجودة — أعد الاتصال' })
      if (room.phase !== 'GAME_OVER') return ack?.({ error: 'اللعبة لم تنتهِ بعد' })
      if (!requireHost(room, socket)) return ack?.({ error: 'المضيف فقط يقدر يبدأ الجولة التالية' })
      if (!room.tournament || room.tournament.gameIndex >= room.tournament.totalGames) {
        return ack?.({ error: 'لا توجد جولة بطولة تالية' })
      }
      startNextTournamentGame(io, room)
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

    // Host-only, once per round, and only while the question is up for grabs (ANSWERING).
    // Never touches answerTimer/answerDeadline — the countdown already running is unaffected.
    safeOn(socket, 'swap_question', (ack?: Ack<any>) => {
      if (isRateLimited(`swap_question:${socket.id}`, 5, 10_000)) return ack?.({ success: false, error: 'rate_limited' })
      const room = currentRoom(socket)
      if (!room) return ack?.({ success: false, error: 'room_not_found' })
      if (!requireHost(room, socket)) return ack?.({ success: false, error: 'host_only' })
      if (room.phase !== 'ANSWERING') return ack?.({ success: false, error: 'not_answering_phase' })
      if (room.questionSwapped) return ack?.({ success: false, error: 'already_used' })
      const swapped = swapQuestion(io, room)
      ack?.({ success: swapped })
    })

    // Each player, once per game: extends the current ANSWERING round's remaining time by
    // 10s. Tracked on the room itself (freezesUsed), not persisted — resets whenever a fresh
    // game starts (createRoom / resetRoomForNextTournamentGame).
    safeOn(socket, 'freeze_round', (ack?: Ack<any>) => {
      if (isRateLimited(`freeze_round:${socket.id}`, 5, 10_000)) return ack?.({ success: false, error: 'rate_limited' })
      const room = currentRoom(socket)
      const playerId = socket.data.playerId as string | undefined
      if (!room || !playerId) return ack?.({ success: false, error: 'room_not_found' })
      if (room.phase !== 'ANSWERING') return ack?.({ success: false, error: 'not_answering_phase' })
      if (room.freezesUsed.has(playerId)) return ack?.({ success: false, reason: 'already_used' })

      room.freezesUsed.add(playerId)
      const extended = extendAnsweringTimer(io, room, 10)
      ack?.({ success: extended })
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
    registerPremiumHandlers(io, socket)
    registerRecoveryHandlers(io, socket)
    registerDebugHandlers(io, socket)
    registerAdminHandlers(io, socket)
    registerReactionHandlers(io, socket)
    registerSuggestionHandlers(io, socket)
    registerGiftHandlers(io, socket)

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
  const displayRoomCode = socket.data.displayRoomCode as string | undefined
  if (displayRoomCode) {
    const displayRoom = getRoom(displayRoomCode)
    if (displayRoom) {
      removeDisplay(displayRoom, socket.id)
      io.to(displayRoom.code).emit('phase_changed', { phase: displayRoom.phase, room: publicRoomView(displayRoom) })
    }
    socket.data.displayRoomCode = undefined
  }

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
