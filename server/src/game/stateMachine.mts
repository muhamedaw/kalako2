import crypto from 'node:crypto'
import type { Server } from 'socket.io'
import { config } from '../config.mts'
import { pickCategories, pickQuestion } from './questionBank.mts'
import { computeRoundScoring } from './scoring.mts'
import { connectedPlayers, destroyRoom, resetRoomForNextTournamentGame } from './roomManager.mts'
import { persistFinishedGame } from '../db/gameHistoryRepo.mts'
import { awardCoinsForFinishedGame } from '../socket/economy.mts'
import { hasExpansionAccess } from './categoryAccess.mts'
import { getDb, persistToDisk } from '../db/index.mts'
import type { RoomState } from './types.mts'

/** One row per (device, question) actually served — drives the category-completion %
 * feature. Best-effort: a device without a linked profile (deviceId null) is simply skipped,
 * matching how coin-earning already treats guests with no deviceId. */
function recordSeenQuestions(room: RoomState, category: string, questionId: string) {
  const db = getDb()
  let wrote = false
  for (const player of connectedPlayers(room)) {
    if (!player.deviceId) continue
    try {
      db.run(
        `INSERT OR IGNORE INTO player_seen_questions (device_id, question_id, category) VALUES (?, ?, ?)`,
        [player.deviceId, questionId, category]
      )
      wrote = true
    } catch (err) {
      console.error(`[kalak] failed to record seen question for device ${player.deviceId}:`, err)
    }
  }
  if (wrote) persistToDisk()
}

function emitRoom(io: Server, room: RoomState, event: string, payload: unknown) {
  io.to(room.code).emit(event, payload)
}

export function publicRoomView(room: RoomState) {
  return {
    code: room.code,
    roomName: room.roomName,
    hostId: room.hostId,
    phase: room.phase,
    round: room.round,
    isTiebreakerRound: room.isTiebreakerRound,
    settings: room.settings,
    displayCount: room.displays.size,
    tournament: room.tournament ? { gameIndex: room.tournament.gameIndex, totalGames: room.tournament.totalGames } : null,
    players: [...room.players.values()].map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      isHost: p.isHost,
      isPremium: p.isPremium,
      connected: p.connected,
    })),
  }
}

function clearTimers(room: RoomState) {
  if (room.answerTimer) clearTimeout(room.answerTimer)
  if (room.voteTimer) clearTimeout(room.voteTimer)
  room.answerTimer = null
  room.voteTimer = null
  room.answerDeadline = null
}

export function startRound(io: Server, room: RoomState) {
  clearTimers(room)
  room.round += 1
  room.isTiebreakerRound = false
  room.phase = 'CATEGORY_PICK'
  room.categoryOptions = pickCategories(room.settings.allowedCategories, 4)
  room.answers.clear()
  room.votes.clear()
  room.voteSlots.clear()
  room.currentQuestion = null

  emitRoom(io, room, 'phase_changed', {
    phase: room.phase,
    room: publicRoomView(room),
    categoryOptions: room.categoryOptions,
  })
}

function isDoublePointsRound(room: RoomState): boolean {
  return !room.isTiebreakerRound && room.doublePointsRound !== null && room.round === room.doublePointsRound
}

export function beginAnswering(io: Server, room: RoomState, category: string) {
  const chosenCategory = room.categoryOptions.includes(category) ? category : room.categoryOptions[0]
  // If ANY connected player in the room bought the expansion pack for this category, everyone
  // in the room benefits for this game — matches the "inventory-based like cosmetics" scope
  // (simplest real behavior; a per-player-visible-only pool would need per-player question
  // fan-out, which isn't how this game broadcasts questions).
  const includeExpansion = connectedPlayers(room).some((p) => hasExpansionAccess(p.deviceId, chosenCategory))
  room.currentQuestion = pickQuestion(chosenCategory, room.settings.familyMode, room.settings.language, includeExpansion)
  recordSeenQuestions(room, chosenCategory, room.currentQuestion.id)
  room.phase = 'ANSWERING'
  room.answers.clear()
  room.votes.clear()
  room.voteSlots.clear()
  room.questionSwapped = false

  const timeSeconds = room.isTiebreakerRound ? config.tiebreakerTimeSeconds : room.settings.answerTimeSeconds

  emitRoom(io, room, 'phase_changed', {
    phase: room.phase,
    room: publicRoomView(room),
    question: {
      category: room.currentQuestion.category,
      text: room.currentQuestion.text,
      ...(room.currentQuestion.imageUrl && { imageUrl: room.currentQuestion.imageUrl }),
      ...(room.currentQuestion.sourceAttribution && { sourceAttribution: room.currentQuestion.sourceAttribution }),
    },
    timeSeconds,
    isDoublePointsRound: isDoublePointsRound(room),
  })

  clearTimers(room)
  room.answerDeadline = Date.now() + timeSeconds * 1000
  room.answerTimer = setTimeout(() => transitionToVoting(io, room), timeSeconds * 1000)
}

/** Host's one-time reroll for the current round — swaps to a different random question in
 * the SAME category, excluding the current one. Deliberately does not touch answerTimer/
 * answerDeadline: the countdown keeps running exactly as it was, only the question changes. */
export function swapQuestion(io: Server, room: RoomState): boolean {
  if (room.phase !== 'ANSWERING' || !room.currentQuestion || room.questionSwapped) return false

  const category = room.currentQuestion.category
  const includeExpansion = connectedPlayers(room).some((p) => hasExpansionAccess(p.deviceId, category))
  const newQuestion = pickQuestion(category, room.settings.familyMode, room.settings.language, includeExpansion, room.currentQuestion.id)
  room.currentQuestion = newQuestion
  room.questionSwapped = true
  recordSeenQuestions(room, category, newQuestion.id)

  emitRoom(io, room, 'question_swapped', {
    question: {
      category: newQuestion.category,
      text: newQuestion.text,
      ...(newQuestion.imageUrl && { imageUrl: newQuestion.imageUrl }),
      ...(newQuestion.sourceAttribution && { sourceAttribution: newQuestion.sourceAttribution }),
    },
  })
  return true
}

/** One-time-per-player timer extension (freeze_round). Adds to the REMAINING time correctly
 * (via the absolute answerDeadline) rather than naively adding +10s to a fresh setTimeout,
 * which would double-count however much of the original window was already spent. */
export function extendAnsweringTimer(io: Server, room: RoomState, extraSeconds: number): boolean {
  if (room.phase !== 'ANSWERING' || !room.answerTimer || room.answerDeadline === null) return false
  clearTimeout(room.answerTimer)
  room.answerDeadline += extraSeconds * 1000
  const remainingMs = Math.max(room.answerDeadline - Date.now(), 0)
  room.answerTimer = setTimeout(() => transitionToVoting(io, room), remainingMs)
  emitRoom(io, room, 'timer_extended', { extraSeconds, newDeadline: room.answerDeadline })
  return true
}

export function maybeAllAnswered(io: Server, room: RoomState) {
  const connected = connectedPlayers(room)
  if (connected.length > 0 && room.answers.size >= connected.length) {
    transitionToVoting(io, room)
  }
}

export function transitionToVoting(io: Server, room: RoomState) {
  if (room.phase !== 'ANSWERING') return
  clearTimers(room)
  room.phase = 'VOTING'

  const slots: Array<{ slotId: string; text: string }> = []
  room.voteSlots.clear()

  for (const [playerId, answer] of room.answers) {
    const slotId = crypto.randomUUID()
    room.voteSlots.set(slotId, playerId)
    slots.push({ slotId, text: answer.text })
  }
  const correctSlotId = crypto.randomUUID()
  room.voteSlots.set(correctSlotId, 'CORRECT')
  slots.push({ slotId: correctSlotId, text: room.currentQuestion!.answer })

  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[slots[i], slots[j]] = [slots[j], slots[i]]
  }

  emitRoom(io, room, 'phase_changed', { phase: room.phase, room: publicRoomView(room), answers: slots })

  // Tell each connected player which slot is their own so the client can disable voting for it.
  for (const [playerId, answer] of room.answers) {
    void answer
    const ownSlot = [...room.voteSlots.entries()].find(([, owner]) => owner === playerId)?.[0]
    const player = room.players.get(playerId)
    if (player?.socketId && ownSlot) {
      io.to(player.socketId).emit('your_answer_slot', { slotId: ownSlot })
    }
  }

  const timeSeconds = room.isTiebreakerRound ? config.tiebreakerTimeSeconds : config.voteTimeSeconds
  room.voteTimer = setTimeout(() => computeResults(io, room), timeSeconds * 1000)
}

export function maybeAllVoted(io: Server, room: RoomState) {
  const connected = connectedPlayers(room)
  const eligibleVoters = connected.length
  if (eligibleVoters > 0 && room.votes.size >= eligibleVoters) {
    computeResults(io, room)
  }
}

export function computeResults(io: Server, room: RoomState) {
  if (room.phase !== 'VOTING') return
  clearTimers(room)
  room.phase = 'RESULTS'

  const { deltas, answerRecords, correctVoterIds } = computeRoundScoring(room.answers, room.votes)
  const multiplier = isDoublePointsRound(room) ? 2 : 1

  for (const [playerId, delta] of deltas) {
    const player = room.players.get(playerId)
    if (player) player.score += delta * multiplier
  }
  for (const voterId of correctVoterIds) {
    room.correctGuessCounts.set(voterId, (room.correctGuessCounts.get(voterId) ?? 0) + 1)
  }
  if (multiplier > 1) {
    for (const record of answerRecords) record.pointsAwarded *= multiplier
  }

  room.history.push({
    roundNumber: room.round,
    isTiebreaker: room.isTiebreakerRound,
    category: room.currentQuestion!.category,
    questionText: room.currentQuestion!.text,
    correctAnswer: room.currentQuestion!.answer,
    answers: answerRecords,
  })

  const correctAnswerText = room.currentQuestion!.answer
  const blind = room.settings.blindVotingEnabled
  const revealedAnswers = answerRecords.map((a) => ({
    playerId: a.playerId,
    playerName: room.players.get(a.playerId)?.name ?? '?',
    text: a.text,
    ...(blind ? {} : { votesReceived: a.votesReceived, pointsAwarded: a.pointsAwarded }),
  }))

  emitRoom(io, room, 'phase_changed', {
    phase: room.phase,
    room: publicRoomView(room),
    results: {
      correctAnswer: correctAnswerText,
      answers: revealedAnswers,
      scores: publicRoomView(room).players,
      wasDoublePoints: multiplier > 1,
    },
  })

  setTimeout(() => advanceAfterResults(io, room), 5000)
}

function topScoreTiedPlayers(room: RoomState) {
  const players = connectedPlayers(room)
  if (players.length === 0) return []
  const top = Math.max(...players.map((p) => p.score))
  return players.filter((p) => p.score === top)
}

function advanceAfterResults(io: Server, room: RoomState) {
  if (room.isTiebreakerRound) {
    const tied = topScoreTiedPlayers(room)
    room.tiebreakerAttempt += 1
    if (tied.length > 1 && room.tiebreakerAttempt < config.maxTiebreakerRounds) {
      startTiebreaker(io, room)
    } else {
      endGame(io, room)
    }
    return
  }

  if (room.round >= room.settings.roundsCount) {
    const tied = topScoreTiedPlayers(room)
    if (tied.length > 1) {
      room.tiebreakerAttempt = 0
      startTiebreaker(io, room)
    } else {
      endGame(io, room)
    }
    return
  }

  startRound(io, room)
}

function startTiebreaker(io: Server, room: RoomState) {
  clearTimers(room)
  room.isTiebreakerRound = true
  room.phase = 'CATEGORY_PICK'
  room.categoryOptions = pickCategories(room.settings.allowedCategories, 4)
  room.answers.clear()
  room.votes.clear()
  room.voteSlots.clear()
  room.currentQuestion = null

  emitRoom(io, room, 'phase_changed', {
    phase: room.phase,
    room: publicRoomView(room),
    categoryOptions: room.categoryOptions,
    tiebreaker: true,
  })
}

function computeFoolCounts(room: RoomState) {
  const foolCounts = new Map<string, number>()
  for (const round of room.history) {
    for (const answer of round.answers) {
      foolCounts.set(answer.playerId, (foolCounts.get(answer.playerId) ?? 0) + answer.votesReceived)
    }
  }
  return foolCounts
}

function mostDeceptivePlayer(room: RoomState) {
  const foolCounts = computeFoolCounts(room)
  let bestId: string | null = null
  let bestCount = 0
  for (const [playerId, count] of foolCounts) {
    if (count > bestCount) {
      bestId = playerId
      bestCount = count
    }
  }
  if (!bestId || bestCount === 0) return null
  const player = room.players.get(bestId)
  if (!player) return null
  return { id: player.id, name: player.name, timesFooledOthers: bestCount }
}

function endGame(io: Server, room: RoomState) {
  clearTimers(room)
  room.phase = 'GAME_OVER'
  const finalStandings = [...room.players.values()]
    .sort((a, b) => b.score - a.score)
    .map((p) => ({ id: p.id, name: p.name, score: p.score }))

  // Tournament: fold this game's scores into the running cumulative total for the payload
  // (the actual room.tournament.cumulativeScores mutation happens later, only when the host
  // advances to the next game — this is a preview so GAME_OVER can show it immediately).
  const tournamentPayload = room.tournament ? {
    gameIndex: room.tournament.gameIndex,
    totalGames: room.tournament.totalGames,
    isFinalGame: room.tournament.gameIndex >= room.tournament.totalGames,
    cumulativeStandings: [...room.players.values()]
      .map((p) => ({
        id: p.id,
        name: p.name,
        cumulativeScore: (room.tournament!.cumulativeScores.get(p.id) ?? 0) + p.score,
      }))
      .sort((a, b) => b.cumulativeScore - a.cumulativeScore),
  } : null

  emitRoom(io, room, 'phase_changed', {
    phase: room.phase,
    room: publicRoomView(room),
    finalStandings,
    mostDeceptivePlayer: mostDeceptivePlayer(room),
    tournament: tournamentPayload,
  })

  try {
    persistFinishedGame(room, room.history)
  } catch (err) {
    console.error(`[kalak] failed to persist game history for room ${room.code}:`, err)
  }

  const foolCounts = computeFoolCounts(room)
  for (const player of room.players.values()) {
    if (!player.deviceId) continue
    const roundsCorrect = room.correctGuessCounts.get(player.id) ?? 0
    const playersTricked = foolCounts.get(player.id) ?? 0
    const coinsEarned = 10 + 5 * roundsCorrect + 5 * playersTricked
    try {
      awardCoinsForFinishedGame(player.deviceId, player.name, coinsEarned)
    } catch (err) {
      console.error(`[kalak] failed to award coins to device ${player.deviceId}:`, err)
    }
  }

  // Mid-series: leave the room alive so the host can start the next game. Only the final
  // game (or a non-tournament game) schedules the usual cleanup.
  if (!tournamentPayload || tournamentPayload.isFinalGame) {
    setTimeout(() => destroyRoom(room.code), 60_000)
  }
}

/** Host-triggered advance to the next game in a tournament series. Only valid from
 * GAME_OVER, with games remaining — enforced by the caller (socket/index.mts). */
export function startNextTournamentGame(io: Server, room: RoomState) {
  resetRoomForNextTournamentGame(room)
  emitRoom(io, room, 'phase_changed', {
    phase: room.phase,
    room: publicRoomView(room),
    tournament: room.tournament ? {
      gameIndex: room.tournament.gameIndex,
      totalGames: room.tournament.totalGames,
    } : null,
  })
}
