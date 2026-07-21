import { motion } from 'framer-motion'

interface PlayerAvatarProps {
  emoji: string
  name: string
  isHost?: boolean
  isCurrentPlayer?: boolean
  isConnected?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'text-2xl w-10 h-10',
  md: 'text-3xl w-14 h-14',
  lg: 'text-4xl w-18 h-18',
}

export default function PlayerAvatar({
  emoji,
  name,
  isHost = false,
  isCurrentPlayer = false,
  isConnected = true,
  size = 'md',
}: PlayerAvatarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-1.5"
    >
      <div
        className={`
          ${sizes[size]}
          flex items-center justify-center rounded-full
          ${isCurrentPlayer ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''}
          ${!isConnected ? 'opacity-30 grayscale' : ''}
          bg-white/5 border border-white/10
          transition-all
        `}
      >
        <span className="select-none">{emoji}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className={`text-xs font-medium truncate max-w-16 ${isCurrentPlayer ? 'text-primary' : 'text-white/60'}`}>
          {name}
        </span>
        {isHost && (
          <span className="text-[10px] text-warning" aria-label="المضيف">👑</span>
        )}
      </div>
    </motion.div>
  )
}
