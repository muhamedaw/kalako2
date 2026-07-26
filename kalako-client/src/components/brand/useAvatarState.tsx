import type { JSX } from 'react'
import { ComposedAvatar, getAvatarConfig } from '@/components/avatarParts'

export function useAvatarState(avatarId: number): JSX.Element {
  return <ComposedAvatar {...getAvatarConfig(avatarId)} />
}
