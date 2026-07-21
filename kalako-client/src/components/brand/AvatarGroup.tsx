import type { AvatarState } from './theme'
import Avatar from './Avatar'

interface Props {
  count?: number
  state?: AvatarState
  size?: number
  className?: string
}

export default function AvatarGroup({ count = 4, state = 'idle', size = 120, className }: Props) {
  return (
    <div className={`flex flex-wrap justify-center gap-2 ${className ?? ''}`}>
      {Array.from({ length: Math.min(count, 16) }, (_, i) => (
        <Avatar key={i + 1} id={i + 1} state={state} size={size} />
      ))}
    </div>
  )
}
