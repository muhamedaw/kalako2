import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Server, Socket } from 'socket.io'
import { config } from '../config.mts'
import { reloadQuestionBank, allCategories } from '../game/questionBank.mts'
import { getDb, persistToDisk } from '../db/index.mts'
import { isRateLimited } from './rateLimit.mts'
import { asObject, asString } from './validate.mts'
import { safeOn } from './wrapHandler.mts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const serverRoot = path.resolve(__dirname, '..', '..')
const questionsDir = path.join(serverRoot, 'src', 'data', 'questions')
const categoryMetaPath = path.join(serverRoot, 'src', 'data', 'categoryMeta.json')
const LANGUAGES = ['ar', 'en', 'he'] as const
type Lang = (typeof LANGUAGES)[number]

// ─── Session tokens ───
// In-memory only, single process — matches this project's existing rate-limiter pattern
// (server.mts has no shared store like Redis, and doesn't need one at this scale).
const SESSION_TTL_MS = 4 * 60 * 60 * 1000 // 4 hours
const sessions = new Map<string, number>() // token -> expiresAt

function isValidSession(token: string | undefined): boolean {
  if (!token) return false
  const expiresAt = sessions.get(token)
  if (!expiresAt) return false
  if (Date.now() > expiresAt) {
    sessions.delete(token)
    return false
  }
  return true
}

// ─── Category display-name metadata ───
// The question-bank JSON files themselves have no concept of a display name (just a
// filename == category id). This is the admin dashboard's own record of what to call each
// category; it does NOT retroactively relabel the live client's hardcoded CATEGORY_LABELS
// (kalako-client/src/types.ts) — a category added here plays immediately using its raw id
// as the label until someone also updates that client-side map. Documented, not silently magic.
function readCategoryMeta(): Record<string, { ar: string; en: string; he: string }> {
  try {
    return JSON.parse(fs.readFileSync(categoryMetaPath, 'utf-8'))
  } catch {
    return {}
  }
}

function writeCategoryMeta(meta: Record<string, { ar: string; en: string; he: string }>) {
  fs.writeFileSync(categoryMetaPath, JSON.stringify(meta, null, 2), 'utf-8')
}

// ─── Question file I/O ───
interface StoredQuestion {
  id: string
  category: string
  text: string
  answer: string
  ageRating: 'family' | 'adult'
  imageUrl?: string
  sourceAttribution?: string
}

function categoryFilePath(categoryId: string, language: Lang): string {
  return path.join(questionsDir, language, `${categoryId}.json`)
}

function readCategoryFile(categoryId: string, language: Lang): StoredQuestion[] {
  const filePath = categoryFilePath(categoryId, language)
  if (!fs.existsSync(filePath)) return []
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return []
  }
}

function writeCategoryFile(categoryId: string, language: Lang, questions: StoredQuestion[]) {
  const filePath = categoryFilePath(categoryId, language)
  fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf-8')
}

/** Fetches the URL and confirms the response is actually an image before we ever save it —
 * a broken/non-image URL pasted into a picture-round question would otherwise silently
 * render as a broken image to real players mid-game. HEAD first (cheap), falls back to a
 * ranged GET since some CDNs don't implement HEAD. */
async function validateImageUrl(url: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  // Admin dashboard's "upload from computer" feature sends a client-compressed
  // data: URI directly (no object-storage service configured for this project) —
  // it's self-contained, so just sanity-check the format/size instead of an HTTP HEAD.
  if (url.startsWith('data:image/')) {
    if (url.length > 2_000_000) {
      return { ok: false, reason: 'Image is too large even after compression — try a smaller image' }
    }
    return { ok: true }
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return { ok: false, reason: 'Not a valid URL' }
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, reason: 'URL must be http(s), or an uploaded image' }
  }

  const checkContentType = (res: Response) => {
    const contentType = res.headers.get('content-type') || ''
    return contentType.startsWith('image/')
  }

  try {
    const headRes = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(8000) })
    if (headRes.ok && checkContentType(headRes)) return { ok: true }
    if (headRes.ok && !checkContentType(headRes)) {
      return { ok: false, reason: `URL does not point to an image (content-type: ${headRes.headers.get('content-type') || 'unknown'})` }
    }
    // HEAD returned non-ok (some servers reject HEAD entirely) — fall through to GET.
  } catch {
    // HEAD failed outright (network error, unsupported) — fall through to GET.
  }

  try {
    const getRes = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-1024' }, signal: AbortSignal.timeout(8000) })
    if (!getRes.ok) return { ok: false, reason: `URL returned HTTP ${getRes.status}` }
    if (!checkContentType(getRes)) {
      return { ok: false, reason: `URL does not point to an image (content-type: ${getRes.headers.get('content-type') || 'unknown'})` }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, reason: `Could not reach URL: ${err instanceof Error ? err.message : 'unknown error'}` }
  }
}

type Ack = (res: unknown) => void

export function registerAdminHandlers(io: Server, socket: Socket) {
  safeOn(socket, 'admin_authenticate', (_payload: unknown, ack?: Ack) => {
    if (isRateLimited(`admin_authenticate:${socket.id}`, 5, 60_000)) {
      return ack?.({ success: false, error: 'rate_limited' })
    }
    const payload = asObject<{ password?: string }>(_payload)
    const password = asString(payload.password)
    if (!config.adminPassword) {
      return ack?.({ success: false, error: 'admin_not_configured' })
    }
    if (!password || password !== config.adminPassword) {
      return ack?.({ success: false, error: 'invalid_password' })
    }
    const sessionToken = crypto.randomBytes(32).toString('base64url')
    sessions.set(sessionToken, Date.now() + SESSION_TTL_MS)
    ack?.({ success: true, sessionToken })
  })

  safeOn(socket, 'admin_list_categories', (_payload: unknown, ack?: Ack) => {
    const payload = asObject<{ sessionToken?: string }>(_payload)
    if (!isValidSession(asString(payload.sessionToken))) return ack?.({ error: 'unauthorized' })

    try {
      const meta = readCategoryMeta()
      const categories = allCategories.map((id) => {
        const counts: Record<Lang, number> = { ar: 0, en: 0, he: 0 }
        for (const lang of LANGUAGES) counts[lang] = readCategoryFile(id, lang).length
        return { id, displayNames: meta[id] || { ar: id, en: id, he: id }, counts }
      })
      ack?.(categories)
    } catch (err) {
      console.error('[kalak] admin_list_categories failed:', err)
      ack?.({ error: 'list_failed' })
    }
  })

  safeOn(socket, 'admin_add_category', (_payload: unknown, ack?: Ack) => {
    const payload = asObject<{ sessionToken?: string; id?: string; displayNames?: { ar?: string; en?: string; he?: string } }>(_payload)
    if (!isValidSession(asString(payload.sessionToken))) return ack?.({ error: 'unauthorized' })

    const id = (asString(payload.id) || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (!id) return ack?.({ error: 'A category id (letters/numbers/underscore only) is required' })
    if (allCategories.includes(id)) return ack?.({ error: 'A category with this id already exists' })

    const displayNames = {
      ar: asString(payload.displayNames?.ar) || id,
      en: asString(payload.displayNames?.en) || id,
      he: asString(payload.displayNames?.he) || id,
    }

    try {
      for (const lang of LANGUAGES) {
        const filePath = categoryFilePath(id, lang)
        if (!fs.existsSync(filePath)) writeCategoryFile(id, lang, [])
      }
      const meta = readCategoryMeta()
      meta[id] = displayNames
      writeCategoryMeta(meta)
      reloadQuestionBank()
      ack?.({ success: true, id, displayNames })
    } catch (err) {
      console.error('[kalak] admin_add_category failed:', err)
      ack?.({ error: 'add_category_failed' })
    }
  })

  safeOn(socket, 'admin_list_questions', (_payload: unknown, ack?: Ack) => {
    const payload = asObject<{ sessionToken?: string; categoryId?: string; language?: string }>(_payload)
    if (!isValidSession(asString(payload.sessionToken))) return ack?.({ error: 'unauthorized' })

    const categoryId = asString(payload.categoryId)
    const language = asString(payload.language) as Lang | undefined
    if (!categoryId || !language || !LANGUAGES.includes(language)) {
      return ack?.({ error: 'categoryId and a valid language are required' })
    }
    try {
      ack?.(readCategoryFile(categoryId, language))
    } catch (err) {
      console.error('[kalak] admin_list_questions failed:', err)
      ack?.({ error: 'list_failed' })
    }
  })

  safeOn(socket, 'admin_add_question', async (_payload: unknown, ack?: Ack) => {
    const payload = asObject<{
      sessionToken?: string; categoryId?: string; language?: string
      questionText?: string; correctAnswer?: string; ageRating?: string
      imageUrl?: string; sourceAttribution?: string
    }>(_payload)
    if (!isValidSession(asString(payload.sessionToken))) return ack?.({ error: 'unauthorized' })

    const categoryId = asString(payload.categoryId)
    const language = asString(payload.language) as Lang | undefined
    const questionText = (asString(payload.questionText) || '').trim()
    const correctAnswer = (asString(payload.correctAnswer) || '').trim()
    const ageRating = asString(payload.ageRating) === 'adult' ? 'adult' : 'family'
    const imageUrl = asString(payload.imageUrl)?.trim() || undefined
    const sourceAttribution = asString(payload.sourceAttribution)?.trim() || undefined

    if (!categoryId || !language || !LANGUAGES.includes(language)) {
      return ack?.({ error: 'categoryId and a valid language are required' })
    }
    if (!questionText || !correctAnswer) {
      return ack?.({ error: 'questionText and correctAnswer are required' })
    }
    if (!allCategories.includes(categoryId)) {
      return ack?.({ error: 'Unknown categoryId — add the category first' })
    }

    if (imageUrl) {
      const validation = await validateImageUrl(imageUrl)
      if (!validation.ok) return ack?.({ error: `Image URL rejected: ${validation.reason}` })
    }

    try {
      const questions = readCategoryFile(categoryId, language)
      const newQuestion: StoredQuestion = {
        id: `${categoryId}_admin_${crypto.randomBytes(4).toString('hex')}`,
        category: categoryId,
        text: questionText,
        answer: correctAnswer,
        ageRating,
        ...(imageUrl && { imageUrl }),
        ...(sourceAttribution && { sourceAttribution }),
      }
      questions.push(newQuestion)
      writeCategoryFile(categoryId, language, questions)
      reloadQuestionBank()
      ack?.({ success: true, question: newQuestion })
    } catch (err) {
      console.error('[kalak] admin_add_question failed:', err)
      ack?.({ error: 'add_question_failed' })
    }
  })

  safeOn(socket, 'admin_edit_question', async (_payload: unknown, ack?: Ack) => {
    const payload = asObject<{
      sessionToken?: string; questionId?: string; categoryId?: string; language?: string
      questionText?: string; correctAnswer?: string; ageRating?: string
      imageUrl?: string; sourceAttribution?: string
    }>(_payload)
    if (!isValidSession(asString(payload.sessionToken))) return ack?.({ error: 'unauthorized' })

    const questionId = asString(payload.questionId)
    const categoryId = asString(payload.categoryId)
    const language = asString(payload.language) as Lang | undefined
    if (!questionId || !categoryId || !language || !LANGUAGES.includes(language)) {
      return ack?.({ error: 'questionId, categoryId and a valid language are required' })
    }

    const imageUrl = asString(payload.imageUrl)?.trim()
    if (imageUrl) {
      const validation = await validateImageUrl(imageUrl)
      if (!validation.ok) return ack?.({ error: `Image URL rejected: ${validation.reason}` })
    }

    try {
      const questions = readCategoryFile(categoryId, language)
      const index = questions.findIndex((q) => q.id === questionId)
      if (index === -1) return ack?.({ error: 'Question not found' })

      const existing = questions[index]
      const questionText = asString(payload.questionText)?.trim()
      const correctAnswer = asString(payload.correctAnswer)?.trim()
      const ageRating = payload.ageRating !== undefined ? (asString(payload.ageRating) === 'adult' ? 'adult' : 'family') : existing.ageRating
      const sourceAttribution = asString(payload.sourceAttribution)?.trim()

      questions[index] = {
        ...existing,
        text: questionText || existing.text,
        answer: correctAnswer || existing.answer,
        ageRating,
        ...(imageUrl !== undefined && { imageUrl: imageUrl || undefined }),
        ...(sourceAttribution !== undefined && { sourceAttribution: sourceAttribution || undefined }),
      }
      writeCategoryFile(categoryId, language, questions)
      reloadQuestionBank()
      ack?.({ success: true, question: questions[index] })
    } catch (err) {
      console.error('[kalak] admin_edit_question failed:', err)
      ack?.({ error: 'edit_question_failed' })
    }
  })

  // A question mid-use in a live round is always safe to delete: stateMachine.mts's
  // beginAnswering copies the picked Question by value into room.currentQuestion at pick
  // time — the room never holds a live reference back into the bank. Deleting here only
  // ever affects which questions can be picked for FUTURE rounds, never one in progress.
  safeOn(socket, 'admin_delete_question', (_payload: unknown, ack?: Ack) => {
    const payload = asObject<{ sessionToken?: string; questionId?: string; categoryId?: string; language?: string }>(_payload)
    if (!isValidSession(asString(payload.sessionToken))) return ack?.({ error: 'unauthorized' })

    const questionId = asString(payload.questionId)
    const categoryId = asString(payload.categoryId)
    const language = asString(payload.language) as Lang | undefined
    if (!questionId || !categoryId || !language || !LANGUAGES.includes(language)) {
      return ack?.({ error: 'questionId, categoryId and a valid language are required' })
    }

    try {
      const questions = readCategoryFile(categoryId, language)
      const filtered = questions.filter((q) => q.id !== questionId)
      if (filtered.length === questions.length) return ack?.({ error: 'Question not found' })
      writeCategoryFile(categoryId, language, filtered)
      reloadQuestionBank()
      ack?.({ success: true })
    } catch (err) {
      console.error('[kalak] admin_delete_question failed:', err)
      ack?.({ error: 'delete_question_failed' })
    }
  })

  // ─── Question-suggestion moderation (Feature 3) ───
  safeOn(socket, 'admin_list_suggestions', (_payload: unknown, ack?: Ack) => {
    const payload = asObject<{ sessionToken?: string; status?: string }>(_payload)
    if (!isValidSession(asString(payload.sessionToken))) return ack?.({ error: 'unauthorized' })

    const status = asString(payload.status)
    try {
      const db = getDb()
      const rows = status
        ? db.exec(
            `SELECT id, device_id, category, question_text, correct_answer, language, status, created_at FROM suggested_questions WHERE status = ? ORDER BY created_at DESC`,
            [status]
          )
        : db.exec(
            `SELECT id, device_id, category, question_text, correct_answer, language, status, created_at FROM suggested_questions ORDER BY created_at DESC`
          )
      const suggestions = rows.length > 0
        ? rows[0].values.map((r: any) => ({
            id: Number(r[0]),
            deviceId: r[1] as string,
            category: r[2] as string,
            questionText: r[3] as string,
            correctAnswer: r[4] as string,
            language: r[5] as string,
            status: r[6] as string,
            createdAt: r[7] as string,
          }))
        : []
      ack?.(suggestions)
    } catch (err) {
      console.error('[kalak] admin_list_suggestions failed:', err)
      ack?.({ error: 'list_failed' })
    }
  })

  safeOn(socket, 'admin_approve_suggestion', (_payload: unknown, ack?: Ack) => {
    const payload = asObject<{ sessionToken?: string; id?: number }>(_payload)
    if (!isValidSession(asString(payload.sessionToken))) return ack?.({ error: 'unauthorized' })

    const id = Number(payload.id)
    if (!Number.isInteger(id)) return ack?.({ error: 'A valid suggestion id is required' })

    try {
      const db = getDb()
      const rows = db.exec(
        `SELECT category, question_text, correct_answer, language, status FROM suggested_questions WHERE id = ?`,
        [id]
      )
      if (rows.length === 0 || rows[0].values.length === 0) return ack?.({ error: 'Suggestion not found' })
      const [category, questionText, correctAnswer, language, status] = rows[0].values[0] as [string, string, string, string, string]
      if (status !== 'pending') return ack?.({ error: 'Suggestion already reviewed' })
      if (!allCategories.includes(category) || !LANGUAGES.includes(language as Lang)) {
        return ack?.({ error: 'Suggestion has an unknown category or language, cannot approve' })
      }

      const questions = readCategoryFile(category, language as Lang)
      const newQuestion: StoredQuestion = {
        id: `${category}_suggested_${crypto.randomBytes(4).toString('hex')}`,
        category,
        text: questionText,
        answer: correctAnswer,
        ageRating: 'family',
      }
      questions.push(newQuestion)
      writeCategoryFile(category, language as Lang, questions)
      reloadQuestionBank()

      db.run(`UPDATE suggested_questions SET status = 'approved' WHERE id = ?`, [id])
      persistToDisk()
      ack?.({ success: true, question: newQuestion })
    } catch (err) {
      console.error('[kalak] admin_approve_suggestion failed:', err)
      ack?.({ error: 'approve_failed' })
    }
  })

  safeOn(socket, 'admin_reject_suggestion', (_payload: unknown, ack?: Ack) => {
    const payload = asObject<{ sessionToken?: string; id?: number }>(_payload)
    if (!isValidSession(asString(payload.sessionToken))) return ack?.({ error: 'unauthorized' })

    const id = Number(payload.id)
    if (!Number.isInteger(id)) return ack?.({ error: 'A valid suggestion id is required' })

    try {
      const db = getDb()
      const rows = db.exec(`SELECT status FROM suggested_questions WHERE id = ?`, [id])
      if (rows.length === 0 || rows[0].values.length === 0) return ack?.({ error: 'Suggestion not found' })
      db.run(`UPDATE suggested_questions SET status = 'rejected' WHERE id = ?`, [id])
      persistToDisk()
      ack?.({ success: true })
    } catch (err) {
      console.error('[kalak] admin_reject_suggestion failed:', err)
      ack?.({ error: 'reject_failed' })
    }
  })
}
