import Avatar from './Avatar'
import type { AvatarState } from './theme'

export function useAvatarState(avatarId: number, state: AvatarState) {
  return <Avatar id={avatarId} state={state} />
}
