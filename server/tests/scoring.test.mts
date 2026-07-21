import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeRoundScoring } from '../src/game/scoring.mts'
import type { SubmittedAnswer, Vote } from '../src/game/types.mts'

test('awards 1 point for guessing the correct answer', () => {
  const answers = new Map<string, SubmittedAnswer>([
    ['p1', { playerId: 'p1', text: 'إجابة كاذبة' }],
  ])
  const votes = new Map<string, Vote>([
    ['p2', { voterId: 'p2', targetPlayerId: 'CORRECT' }],
  ])

  const { deltas } = computeRoundScoring(answers, votes)
  assert.equal(deltas.get('p2'), 1)
  assert.equal(deltas.get('p1'), undefined)
})

test('awards 1 cumulative point per player fooled by a fake answer', () => {
  const answers = new Map<string, SubmittedAnswer>([
    ['p1', { playerId: 'p1', text: 'إجابة كاذبة من p1' }],
  ])
  const votes = new Map<string, Vote>([
    ['p2', { voterId: 'p2', targetPlayerId: 'p1' }],
    ['p3', { voterId: 'p3', targetPlayerId: 'p1' }],
    ['p4', { voterId: 'p4', targetPlayerId: 'CORRECT' }],
  ])

  const { deltas, answerRecords } = computeRoundScoring(answers, votes)
  assert.equal(deltas.get('p1'), 2) // fooled 2 voters
  assert.equal(deltas.get('p4'), 1) // guessed correctly
  assert.equal(answerRecords[0].votesReceived, 2)
  assert.equal(answerRecords[0].pointsAwarded, 2)
})

test('a player can both fool others AND guess correctly in the same round', () => {
  const answers = new Map<string, SubmittedAnswer>([
    ['p1', { playerId: 'p1', text: 'كاذبة p1' }],
    ['p2', { playerId: 'p2', text: 'كاذبة p2' }],
  ])
  const votes = new Map<string, Vote>([
    ['p1', { voterId: 'p1', targetPlayerId: 'CORRECT' }], // p1 guesses correctly
    ['p2', { voterId: 'p2', targetPlayerId: 'p1' }], // p2 falls for p1's fake answer
  ])

  const { deltas } = computeRoundScoring(answers, votes)
  assert.equal(deltas.get('p1'), 2) // +1 correct guess, +1 for fooling p2
  assert.equal(deltas.get('p2'), undefined)
})

test('self-votes are ignored defensively', () => {
  const answers = new Map<string, SubmittedAnswer>([
    ['p1', { playerId: 'p1', text: 'كاذبة p1' }],
  ])
  const votes = new Map<string, Vote>([
    ['p1', { voterId: 'p1', targetPlayerId: 'p1' }],
  ])

  const { deltas } = computeRoundScoring(answers, votes)
  assert.equal(deltas.size, 0)
})

test('players who submitted no answer still get an answer record with 0 votes', () => {
  const answers = new Map<string, SubmittedAnswer>()
  const votes = new Map<string, Vote>()
  const { answerRecords, deltas } = computeRoundScoring(answers, votes)
  assert.equal(answerRecords.length, 0)
  assert.equal(deltas.size, 0)
})
