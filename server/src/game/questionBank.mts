import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Language, Question } from './types.mts'
import { PREMIUM_CATEGORIES } from './categoryAccess.mts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const questionsDir = path.join(__dirname, '..', 'data', 'questions')

const LANGUAGES: Language[] = ['ar', 'en', 'he']
const EXPANSION_SUFFIX = '_expansion'

type RawQuestion = {
  id: string
  category: string
  text: string
  answer: string
  alternateAnswers?: string[]
  ageRating?: 'family' | 'adult'
  imageUrl?: string
  sourceAttribution?: string
}

function toQuestion(q: RawQuestion): Question {
  return {
    id: q.id, category: q.category, text: q.text, answer: q.answer,
    alternateAnswers: q.alternateAnswers, ageRating: q.ageRating ?? 'family',
    imageUrl: q.imageUrl, sourceAttribution: q.sourceAttribution,
  }
}

// bank[language][category] -> questions
const bank = new Map<Language, Map<string, Question[]>>()
// expansionBank[language][category] -> extra questions unlocked by a one-time purchase (see
// categoryAccess.mts). Kept separate from `bank` so category totals/pickCategories are
// unaffected by who has bought what — only pickQuestion opts into merging them in.
const expansionBank = new Map<Language, Map<string, Question[]>>()

// Category list is the same across languages by design; Arabic is the canonical set.
// Exported as the SAME array reference forever — reloadQuestionBank() mutates its contents
// in place (rather than reassigning) so every module that imported this binding earlier
// sees the update too, without needing to re-import.
export const allCategories: string[] = []
export const freeCategories: string[] = []

function loadFromDisk() {
  bank.clear()
  expansionBank.clear()
  for (const lang of LANGUAGES) {
    const langDir = path.join(questionsDir, lang)
    const perCategory = new Map<string, Question[]>()
    const perCategoryExpansion = new Map<string, Question[]>()
    if (fs.existsSync(langDir)) {
      for (const file of fs.readdirSync(langDir)) {
        if (!file.endsWith('.json')) continue
        const baseName = path.basename(file, '.json')
        const raw = JSON.parse(fs.readFileSync(path.join(langDir, file), 'utf-8')) as RawQuestion[]
        if (baseName.endsWith(EXPANSION_SUFFIX)) {
          const category = baseName.slice(0, -EXPANSION_SUFFIX.length)
          perCategoryExpansion.set(category, raw.map(toQuestion))
        } else {
          perCategory.set(baseName, raw.map(toQuestion))
        }
      }
    }
    bank.set(lang, perCategory)
    expansionBank.set(lang, perCategoryExpansion)
  }

  allCategories.length = 0
  allCategories.push(...(bank.get('ar')?.keys() ?? []))
  freeCategories.length = 0
  freeCategories.push(...allCategories.filter((c) => !PREMIUM_CATEGORIES.has(c)))
}

loadFromDisk()

/** Re-reads every question-bank JSON file from disk. Called by the admin dashboard after any
 * write (add/edit/delete category or question) so changes apply to new rooms immediately —
 * no PM2 restart needed. Rooms already mid-game hold a snapshot copy of their current question
 * (see stateMachine.mts's beginAnswering), so a reload never mutates a question underneath an
 * in-progress round. */
export function reloadQuestionBank() {
  loadFromDisk()
}

function resolveLanguage(language: Language): Language {
  return bank.get(language)?.size ? language : 'ar'
}

export function pickQuestion(category: string, familyMode: boolean, language: Language = 'ar', includeExpansion = false, excludeId?: string): Question {
  const lang = resolveLanguage(language)
  const langBank = bank.get(lang)!
  const basePool = langBank.get(category) ?? langBank.get(allCategories[0])!
  const expansionPool = includeExpansion ? (expansionBank.get(lang)?.get(category) ?? []) : []
  const pool = expansionPool.length > 0 ? [...basePool, ...expansionPool] : basePool
  const eligible = familyMode ? pool.filter((q) => q.ageRating === 'family') : pool
  const source = eligible.length > 0 ? eligible : pool
  // Reroll support (swap_question): exclude the current question, but never let an empty
  // result win — a single-question category must still return that same question rather
  // than crash, matching this function's existing "never return nothing" contract.
  const filtered = excludeId ? source.filter((q) => q.id !== excludeId) : source
  const finalSource = filtered.length > 0 ? filtered : source
  return finalSource[Math.floor(Math.random() * finalSource.length)]
}

export function pickCategories(allowed: string[], count: number): string[] {
  const pool = allowed.length > 0 ? allowed.filter((c) => allCategories.includes(c)) : freeCategories
  const source = pool.length > 0 ? pool : freeCategories
  const shuffled = [...source].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

/** Total known question count per category (canonical 'ar' bank sizes) — the denominator
 * for the "X% of category seen" feature. Language-agnostic by design: seen-tracking is keyed
 * by question id, and a player's completion % shouldn't reset just because they switch language. */
export function getCategoryTotalCounts(): Record<string, number> {
  const arBank = bank.get('ar')!
  const totals: Record<string, number> = {}
  for (const category of allCategories) {
    totals[category] = arBank.get(category)?.length ?? 0
  }
  return totals
}
