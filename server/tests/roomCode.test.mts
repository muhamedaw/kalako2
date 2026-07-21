import { test } from 'node:test'
import assert from 'node:assert/strict'
import { generateRoomCode } from '../src/game/roomCode.mts'

test('room code is always 4 characters', () => {
  for (let i = 0; i < 50; i++) {
    assert.equal(generateRoomCode().length, 4)
  }
})

test('room code excludes visually ambiguous characters (0, O, 1, I)', () => {
  for (let i = 0; i < 200; i++) {
    const code = generateRoomCode()
    assert.doesNotMatch(code, /[01OI]/)
  }
})
