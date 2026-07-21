import crypto from 'node:crypto'

// Excludes visually ambiguous characters (0/O, 1/I).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateRoomCode(): string {
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += ALPHABET[crypto.randomInt(ALPHABET.length)]
  }
  return code
}
