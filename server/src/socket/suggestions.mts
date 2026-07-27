import type { Server, Socket } from 'socket.io'
import { getDb, persistToDisk } from '../db/index.mts'
import { allCategories } from '../game/questionBank.mts'
import type { Language } from '../game/types.mts'
import { isRateLimited } from './rateLimit.mts'
import { asObject, asString } from './validate.mts'
import { safeOn } from './wrapHandler.mts'

const LANGUAGES: Language[] = ['ar', 'en', 'he']

export function registerSuggestionHandlers(io: Server, socket: Socket) {
  safeOn(socket, 'suggest_question', (_payload: unknown, ack?: (res: unknown) => void) => {
    const payload = asObject<{
      deviceId?: string; category?: string; questionText?: string; correctAnswer?: string; language?: string
    }>(_payload)
    const deviceId = asString(payload.deviceId)
    if (!deviceId) return ack?.({ success: false, error: 'deviceId required' })
    // "a few per day per device" — 5 per 24h.
    if (isRateLimited(`suggest_question:${deviceId}`, 5, 86_400_000)) return ack?.({ success: false, error: 'rate_limited' })

    const category = asString(payload.category)
    const questionText = (asString(payload.questionText) || '').trim().slice(0, 300)
    const correctAnswer = (asString(payload.correctAnswer) || '').trim().slice(0, 140)
    const language = asString(payload.language)

    if (!category || !allCategories.includes(category)) return ack?.({ success: false, error: 'invalid_category' })
    if (!questionText || !correctAnswer) return ack?.({ success: false, error: 'questionText and correctAnswer are required' })
    if (!language || !LANGUAGES.includes(language as Language)) return ack?.({ success: false, error: 'invalid_language' })

    try {
      const db = getDb()
      db.run(
        `INSERT INTO suggested_questions (device_id, category, question_text, correct_answer, language) VALUES (?, ?, ?, ?, ?)`,
        [deviceId, category, questionText, correctAnswer, language]
      )
      persistToDisk()
      ack?.({ success: true })
    } catch (err) {
      console.error('[kalak] suggest_question failed:', err)
      ack?.({ success: false, error: 'suggest_failed' })
    }
  })
}
