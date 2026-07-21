import { motion } from 'framer-motion'

interface ProgressRingProps {
  size?: number
  strokeWidth?: number
  progress: number
  total: number
  color?: string
}

export default function ProgressRing({
  size = 120,
  strokeWidth = 8,
  progress,
  total,
  color = '#34E4EA',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const fraction = Math.max(0, Math.min(1, progress / total))
  const offset = circumference * (1 - fraction)

  const warningThreshold = total * 0.3
  const displayColor = progress <= warningThreshold ? '#FFB627' : color

  return (
    <div className="relative inline-flex items-center justify-center" role="timer" aria-label={`${Math.ceil(progress)} ثانية متبقية`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={displayColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${displayColor}40)` }}
        />
      </svg>
      <span
        className="absolute text-3xl font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: displayColor }}
      >
        {Math.ceil(progress)}
      </span>
    </div>
  )
}
