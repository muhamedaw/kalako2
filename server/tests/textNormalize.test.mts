import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeAnswerText, isSameAnswer } from '../src/game/textNormalize.mts'

test('normalizes case, whitespace, and trailing punctuation', () => {
  assert.equal(normalizeAnswerText('  Canberra!! '), 'canberra')
  assert.equal(normalizeAnswerText('Paris.'), 'paris')
  assert.equal(normalizeAnswerText('42'), '42')
})

test('strips Arabic tashkeel diacritics', () => {
  assert.equal(normalizeAnswerText('كَانْبِرا'), normalizeAnswerText('كانبرا'))
  assert.equal(normalizeAnswerText('القُدْسُ؟'), normalizeAnswerText('القدس'))
})

test('isSameAnswer matches despite case/punctuation/diacritic differences', () => {
  assert.equal(isSameAnswer('CANBERRA', 'Canberra'), true)
  assert.equal(isSameAnswer('  canberra.', 'Canberra!'), true)
  assert.equal(isSameAnswer('كانبرا', 'كَانْبِرا؟'), true)
})

test('isSameAnswer rejects genuinely different answers', () => {
  assert.equal(isSameAnswer('Paris', 'Canberra'), false)
  assert.equal(isSameAnswer('', 'Canberra'), false)
})
