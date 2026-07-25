// Simple normalization for comparing a submitted answer against the correct one.
// No heavy NLP — just enough to catch "same answer, different casing/punctuation/diacritics".

// Arabic tashkeel/diacritics block: U+064B–U+0652, plus U+0670 (superscript alef)
// and U+06D6–U+06ED (Quranic annotation marks).
const ARABIC_TASHKEEL = /[ً-ْٰۖ-ۭ]/g

// Common trailing/leading punctuation across ar/en/he.
const EDGE_PUNCTUATION = /^[\s.,!?:;"'،؛؟“”]+|[\s.,!?:;"'،؛؟“”]+$/g

export function normalizeAnswerText(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(ARABIC_TASHKEEL, '')
    .replace(EDGE_PUNCTUATION, '')
    .trim()
}

export function isSameAnswer(submitted: string, correct: string): boolean {
  const a = normalizeAnswerText(submitted)
  const b = normalizeAnswerText(correct)
  return a.length > 0 && a === b
}
