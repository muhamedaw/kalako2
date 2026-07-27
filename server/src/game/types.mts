export type Phase =
  | 'LOBBY'
  | 'CATEGORY_PICK'
  | 'ANSWERING'
  | 'VOTING'
  | 'RESULTS'
  | 'TIEBREAKER'
  | 'GAME_OVER'

export type Language = 'ar' | 'en' | 'he'

export interface RoomSettings {
  isPrivate: boolean
  answerTimeSeconds: number
  roundsCount: number
  allowedCategories: string[]
  familyMode: boolean
  doublePointsRoundEnabled: boolean
  blindVotingEnabled: boolean
  language: Language
  /** "Tournament (best of 3 games)" — same room/players play 3 games in a row with a
   * cumulative leaderboard on top of each game's own scoring. See RoomState.tournament. */
  tournamentMode: boolean
}

/** A TV/projector spectator connection — never a Player, never counted toward playerCount
 * or the round-count recommendation, doesn't submit answers/votes. Just watches broadcasts. */
export interface DisplaySession {
  socketId: string
}

export interface TournamentState {
  gameIndex: number
  totalGames: number
  /** playerId -> summed score across all completed games in this series (not the current game's live score). */
  cumulativeScores: Map<string, number>
}

export interface Player {
  id: string // persistent uuid, survives reconnects
  socketId: string | null // null while disconnected
  name: string
  score: number
  isHost: boolean
  isPremium: boolean
  connected: boolean
  disconnectTimer: NodeJS.Timeout | null
  /** client-generated persistent id (localStorage), used to credit the guest-profile economy at game end. Optional: older/no-profile clients simply earn no coins. */
  deviceId: string | null
}

export interface Question {
  id: string
  category: string
  text: string
  answer: string
  ageRating: 'family' | 'adult'
  imageUrl?: string
  sourceAttribution?: string
}

export interface SubmittedAnswer {
  playerId: string
  text: string
}

export interface Vote {
  voterId: string
  targetPlayerId: string | 'CORRECT'
}

export interface RoundAnswerRecord {
  playerId: string
  text: string
  votesReceived: number
  pointsAwarded: number
}

export interface RoundRecord {
  roundNumber: number
  isTiebreaker: boolean
  category: string
  questionText: string
  correctAnswer: string
  answers: RoundAnswerRecord[]
}

export interface RoomState {
  code: string
  hostId: string
  settings: RoomSettings
  players: Map<string, Player>
  phase: Phase
  round: number
  doublePointsRound: number | null
  isTiebreakerRound: boolean
  tiebreakerAttempt: number
  categoryOptions: string[]
  currentQuestion: Question | null
  answers: Map<string, SubmittedAnswer>
  votes: Map<string, Vote>
  /** slotId -> playerId who authored the fake answer, or 'CORRECT' for the real one. Shuffled each round so voting stays anonymous. */
  voteSlots: Map<string, string>
  answerTimer: NodeJS.Timeout | null
  voteTimer: NodeJS.Timeout | null
  history: RoundRecord[]
  createdAt: number
  /** playerId -> count of rounds this game where they voted CORRECT. Drives the "+5 coins per round guessed correctly" formula at game end. */
  correctGuessCounts: Map<string, number>
  /** socketId -> DisplaySession, for "Watch on TV" spectators. Capped separately from players. */
  displays: Map<string, DisplaySession>
  tournament: TournamentState | null
}
