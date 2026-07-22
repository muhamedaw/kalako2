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
}

export interface Player {
  id: string // persistent uuid, survives reconnects
  socketId: string | null // null while disconnected
  name: string
  score: number
  isHost: boolean
  connected: boolean
  disconnectTimer: NodeJS.Timeout | null
}

export interface Question {
  category: string
  text: string
  answer: string
  ageRating: 'family' | 'adult'
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
}
