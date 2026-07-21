import type { JSX } from 'react'
import Avatar from './Avatar'
import type { AvatarState } from './theme'

export function useAvatarState(avatarId: number, state: AvatarState): JSX.Element {
  return <Avatar id={avatarId} state={state} />
}
