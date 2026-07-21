import { getDb, persistToDisk } from './index.mts'
import type { RoomState, RoundRecord } from '../game/types.mts'

function lastInsertRowId(): number {
  const result = getDb().exec('SELECT last_insert_rowid() AS id')
  return Number(result[0]?.values[0]?.[0] ?? 0)
}

/** Persists a completed game and its full round history. Called once at GAME_OVER. */
export function persistFinishedGame(room: RoomState, rounds: RoundRecord[]) {
  const db = getDb()

  db.run(
    `INSERT INTO games (room_code, is_private, answer_time_seconds, rounds_count, ended_at)
     VALUES (?, ?, ?, ?, datetime('now'))`,
    [room.code, room.settings.isPrivate ? 1 : 0, room.settings.answerTimeSeconds, room.settings.roundsCount]
  )
  const gameId = lastInsertRowId()

  for (const player of room.players.values()) {
    db.run(
      `INSERT INTO game_players (game_id, player_id, name, final_score) VALUES (?, ?, ?, ?)`,
      [gameId, player.id, player.name, player.score]
    )
  }

  for (const round of rounds) {
    db.run(
      `INSERT INTO rounds (game_id, round_number, is_tiebreaker, category, question_text, correct_answer)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [gameId, round.roundNumber, round.isTiebreaker ? 1 : 0, round.category, round.questionText, round.correctAnswer]
    )
    const roundId = lastInsertRowId()

    for (const answer of round.answers) {
      db.run(
        `INSERT INTO round_answers (round_id, player_id, answer_text, votes_received, points_awarded)
         VALUES (?, ?, ?, ?, ?)`,
        [roundId, answer.playerId, answer.text, answer.votesReceived, answer.pointsAwarded]
      )
    }
  }

  persistToDisk()
}
