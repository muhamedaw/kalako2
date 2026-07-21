import crypto from 'node:crypto'
import type { Server } from 'socket.io'
import { config } from '../config.mts'
import { pickCategories, pickQuestion } from './questionBank.mts'
import { computeRoundScoring } from './scoring.mts'
import { connectedPlayers, destroyRoom } from './roomManager.mts'
import { persistFinishedGame } from '../db/gameHistoryRepo.mts'
import type { RoomState } from './types.mts'

function emitRoom(io: Server, room: RoomState, event: string, payload: unknown) {
  io.to(room.code).emit(event, payload)
}

export function publicRoomView(room: RoomState) {
  return {
    code: room.code,
    hostId: room.hostId,
    phase: room.phase,
    round: room.round,
    isTiebreakerRound: room.isTiebreakerRound,
    settings: room.settings,
    players: [...room.players.values()].map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      isHost: p.isHost,
      connected: p.connected,
    })),
  }
}

function clearTimers(room: RoomState) {
  if (room.answerTimer) clearTimeout(room.answerTimer)
  if (room.voteTimer) clearTimeout(room.voteTimer)
  room.answerTimer = null
  room.voteTimer = null
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
  room.currentQuestion = pickQuestion(chosenCategory, room.settings.familyMode)
  room.phase = 'ANSWERING'
  room.answers.clear()
  room.votes.clear()
  room.voteSlots.clear()

  const timeSeconds = room.isTiebreakerRound ? config.tiebreakerTimeSeconds : room.settings.answerTimeSeconds

  emitRoom(io, room, 'phase_changed', {
    phase: room.phase,
    room: publicRoomView(room),
    question: { category: room.currentQuestion.category, text: room.currentQuestion.text },
    timeSeconds,
    isDoublePointsRound: isDoublePointsRound(room),
  })

  clearTimers(room)
  room.answerTimer = setTimeout(() => transitionToVoting(io, room), timeSeconds * 1000)
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

  const { deltas, answerRecords } = computeRoundScoring(room.answers, room.votes)
  const multiplier = isDoublePointsRound(room) ? 2 : 1

  for (const [playerId, delta] of deltas) {
    const player = room.players.get(playerId)
    if (player) player.score += delta * multiplier
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

function mostDeceptivePlayer(room: RoomState) {
  const foolCounts = new Map<string, number>()
  for (const round of room.history) {
    for (const answer of round.answers) {
      foolCounts.set(answer.playerId, (foolCounts.get(answer.playerId) ?? 0) + answer.votesReceived)
    }
  }
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

  emitRoom(io, room, 'phase_changed', {
    phase: room.phase,
    room: publicRoomView(room),
    finalStandings,
    mostDeceptivePlayer: mostDeceptivePlayer(room),
  })

  try {
    persistFinishedGame(room, room.history)
  } catch (err) {
    console.error(`[kalak] failed to persist game history for room ${room.code}:`, err)
  }

  setTimeout(() => destroyRoom(room.code), 60_000)
}
