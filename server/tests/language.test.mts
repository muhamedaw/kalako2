import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pickQuestion, allCategories } from '../src/game/questionBank.mts'

test('all 13 categories exist and are identical across languages by design', () => {
  assert.equal(allCategories.length, 13)
  assert.deepEqual(
    [...allCategories].sort(),
    ['celebrities', 'cooking', 'general', 'geography', 'history', 'movies', 'music', 'mythology', 'picture', 'science', 'space', 'sports', 'tech']
  )
})

test('en room returns English questions distinct from the Arabic bank', () => {
  const enTexts = new Set<string>()
  const arTexts = new Set<string>()
  for (let i = 0; i < 100; i++) {
    enTexts.add(pickQuestion('general', true, 'en').text)
    arTexts.add(pickQuestion('general', true, 'ar').text)
  }
  for (const t of enTexts) assert.equal(arTexts.has(t), false)
  // Sanity: English pool actually looks like English (ASCII-heavy), not Arabic script.
  for (const t of enTexts) assert.match(t, /^[\x00-\x7F]+$/)
})

test('he room returns Hebrew questions distinct from the Arabic and English banks', () => {
  const heTexts = new Set<string>()
  for (let i = 0; i < 100; i++) {
    heTexts.add(pickQuestion('history', true, 'he').text)
  }
  for (const t of heTexts) {
    assert.match(t, /[֐-׿]/) // contains Hebrew script
    assert.doesNotMatch(t, /[؀-ۿ]/) // no Arabic script
  }
})

test('unknown/missing language falls back to Arabic rather than crashing', () => {
  const q = pickQuestion('sports', true, 'fr' as any)
  assert.ok(q.text.length > 0)
  assert.match(q.text, /[؀-ۿ]/) // falls back to Arabic
})

test('familyMode still filters adult content for en and he banks', () => {
  for (let i = 0; i < 300; i++) {
    assert.equal(pickQuestion('general', true, 'en').ageRating, 'family')
    assert.equal(pickQuestion('general', true, 'he').ageRating, 'family')
  }
  const enRatings = new Set<string>()
  const heRatings = new Set<string>()
  for (let i = 0; i < 300; i++) {
    enRatings.add(pickQuestion('general', false, 'en').ageRating)
    heRatings.add(pickQuestion('general', false, 'he').ageRating)
  }
  assert.ok(enRatings.has('adult'))
  assert.ok(heRatings.has('adult'))
})
