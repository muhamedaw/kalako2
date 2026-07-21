import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Question } from './types.mts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const questionsDir = path.join(__dirname, '..', 'data', 'questions')

const bank = new Map<string, Question[]>()

for (const file of fs.readdirSync(questionsDir)) {
  if (!file.endsWith('.json')) continue
  const category = path.basename(file, '.json')
  const raw = JSON.parse(fs.readFileSync(path.join(questionsDir, file), 'utf-8')) as Array<{
    category: string
    text: string
    answer: string
    ageRating?: 'family' | 'adult'
  }>
  bank.set(
    category,
    raw.map((q) => ({ category: q.category, text: q.text, answer: q.answer, ageRating: q.ageRating ?? 'family' }))
  )
}

export const allCategories = [...bank.keys()]

export function pickQuestion(category: string, familyMode: boolean): Question {
  const pool = bank.get(category) ?? bank.get(allCategories[0])!
  const eligible = familyMode ? pool.filter((q) => q.ageRating === 'family') : pool
  const source = eligible.length > 0 ? eligible : pool
  return source[Math.floor(Math.random() * source.length)]
}

export function pickCategories(allowed: string[], count: number): string[] {
  const pool = allowed.length > 0 ? allowed.filter((c) => bank.has(c)) : allCategories
  const source = pool.length > 0 ? pool : allCategories
  const shuffled = [...source].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}
