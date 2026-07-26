import { ComposedAvatar, getAvatarConfig } from '@/components/avatarParts'

interface Props {
  count?: number
  size?: number
  className?: string
}

export default function AvatarGroup({ count = 4, size = 120, className }: Props) {
  return (
    <div className={`flex flex-wrap justify-center gap-2 ${className ?? ''}`}>
      {Array.from({ length: Math.min(count, 16) }, (_, i) => (
        <ComposedAvatar key={i + 1} {...getAvatarConfig(i + 1)} size={size} />
      ))}
    </div>
  )
}
