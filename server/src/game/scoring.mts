import type { SubmittedAnswer, Vote, RoundAnswerRecord } from './types.mts'

export interface ScoringResult {
  deltas: Map<string, number>
  answerRecords: RoundAnswerRecord[]
  correctVoterIds: string[]
}

/**
 * Pure scoring function (Fibbage rules):
 * - guessing the real answer  -> +1 point for the voter
 * - each player who falls for your fake answer -> +1 point for you (cumulative)
 */
export function computeRoundScoring(
  answers: Map<string, SubmittedAnswer>,
  votes: Map<string, Vote>
): ScoringResult {
  const deltas = new Map<string, number>()
  const bump = (playerId: string, amount: number) => {
    deltas.set(playerId, (deltas.get(playerId) ?? 0) + amount)
  }

  const votesReceivedByAuthor = new Map<string, number>()
  const correctVoterIds: string[] = []

  for (const vote of votes.values()) {
    if (vote.targetPlayerId === vote.voterId) continue // can't vote own answer
    if (vote.targetPlayerId === 'CORRECT') {
      bump(vote.voterId, 1)
      correctVoterIds.push(vote.voterId)
    } else {
      votesReceivedByAuthor.set(
        vote.targetPlayerId,
        (votesReceivedByAuthor.get(vote.targetPlayerId) ?? 0) + 1
      )
    }
  }

  const answerRecords: RoundAnswerRecord[] = []
  for (const [playerId, answer] of answers) {
    const votesReceived = votesReceivedByAuthor.get(playerId) ?? 0
    if (votesReceived > 0) bump(playerId, votesReceived)
    answerRecords.push({
      playerId,
      text: answer.text,
      votesReceived,
      pointsAwarded: votesReceived,
    })
  }

  return { deltas, answerRecords, correctVoterIds }
}
