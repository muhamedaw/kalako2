import crypto from 'node:crypto'

// Same alphabet style as roomCode.mts: excludes visually ambiguous characters (0/O, 1/I).
const TAG_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function randomPlayerTag(): string {
  let tag = ''
  for (let i = 0; i < 6; i++) tag += TAG_CHARSET[crypto.randomInt(TAG_CHARSET.length)]
  return tag
}
