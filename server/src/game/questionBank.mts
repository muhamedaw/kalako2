import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Language, Question } from './types.mts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const questionsDir = path.join(__dirname, '..', 'data', 'questions')

const LANGUAGES: Language[] = ['ar', 'en', 'he']

// bank[language][category] -> questions
const bank = new Map<Language, Map<string, Question[]>>()

for (const lang of LANGUAGES) {
  const langDir = path.join(questionsDir, lang)
  const perCategory = new Map<string, Question[]>()
  if (fs.existsSync(langDir)) {
    for (const file of fs.readdirSync(langDir)) {
      if (!file.endsWith('.json')) continue
      const category = path.basename(file, '.json')
      const raw = JSON.parse(fs.readFileSync(path.join(langDir, file), 'utf-8')) as Array<{
        category: string
        text: string
        answer: string
        ageRating?: 'family' | 'adult'
      }>
      perCategory.set(
        category,
        raw.map((q) => ({ category: q.category, text: q.text, answer: q.answer, ageRating: q.ageRating ?? 'family' }))
      )
    }
  }
  bank.set(lang, perCategory)
}

// Category list is the same across languages by design; Arabic is the canonical set.
export const allCategories = [...(bank.get('ar')?.keys() ?? [])]

function resolveLanguage(language: Language): Language {
  return bank.get(language)?.size ? language : 'ar'
}

export function pickQuestion(category: string, familyMode: boolean, language: Language = 'ar'): Question {
  const lang = resolveLanguage(language)
  const langBank = bank.get(lang)!
  const pool = langBank.get(category) ?? langBank.get(allCategories[0])!
  const eligible = familyMode ? pool.filter((q) => q.ageRating === 'family') : pool
  const source = eligible.length > 0 ? eligible : pool
  return source[Math.floor(Math.random() * source.length)]
}

export function pickCategories(allowed: string[], count: number): string[] {
  const pool = allowed.length > 0 ? allowed.filter((c) => allCategories.includes(c)) : allCategories
  const source = pool.length > 0 ? pool : allCategories
  const shuffled = [...source].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}
