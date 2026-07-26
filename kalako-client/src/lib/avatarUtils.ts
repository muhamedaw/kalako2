import type { AvatarConfig } from '@/components/avatarParts/types'
import { FREE_BODIES, FREE_EYES, FREE_HATS } from '@/components/avatarParts/types'
import { DEFAULT_AVATAR } from '@/components/avatarParts/types'

export function getAvatarConfig(index: number): AvatarConfig {
  return {
    body: FREE_BODIES[index % FREE_BODIES.length],
    eyes: FREE_EYES[index % FREE_EYES.length],
    hat: FREE_HATS[index % FREE_HATS.length],
  }
}

export function parseAvatarConfig(raw: unknown): AvatarConfig {
  if (!raw || typeof raw !== 'object') return DEFAULT_AVATAR
  const obj = raw as Record<string, unknown>
  if (typeof obj.body !== 'string') return DEFAULT_AVATAR
  if (typeof obj.eyes !== 'string') return DEFAULT_AVATAR
  if (typeof obj.hat !== 'string') return DEFAULT_AVATAR
  return { body: obj.body as AvatarConfig['body'], eyes: obj.eyes as AvatarConfig['eyes'], hat: obj.hat as AvatarConfig['hat'] }
}
