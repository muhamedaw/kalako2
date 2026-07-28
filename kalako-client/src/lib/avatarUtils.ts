import type { AvatarConfig } from '@/components/avatarParts/types'
import { FREE_BODIES, FREE_EYES, FREE_HATS } from '@/components/avatarParts/types'
import { DEFAULT_AVATAR } from '@/components/avatarParts/types'
import type { Translations } from '@/i18n/types'

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

export function getAvatarPartName(id: string, t: Translations): string {
  if (id.startsWith('body_')) {
    const num = id.split('_')[1]
    const key = `avatarBody${num.padStart(2, '0')}` as keyof Translations
    return (t[key] as string) || id
  }
  if (id.startsWith('eyes_premium_')) {
    const num = id.split('_')[2]
    const key = `avatarEyesPremium${num.padStart(2, '0')}` as keyof Translations
    return (t[key] as string) || id
  }
  if (id.startsWith('eyes_')) {
    const num = id.split('_')[1]
    const key = `avatarEyes${num.padStart(2, '0')}` as keyof Translations
    return (t[key] as string) || id
  }
  if (id.startsWith('hat_premium_')) {
    const num = id.split('_')[2]
    const key = `avatarHatPremium${num.padStart(2, '0')}` as keyof Translations
    return (t[key] as string) || id
  }
  if (id.startsWith('hat_')) {
    const hatName = id.replace('hat_', '')
    const pascal = hatName.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')
    const key = `avatarHat${pascal}` as keyof Translations
    return (t[key] as string) || id
  }
  return id
}
