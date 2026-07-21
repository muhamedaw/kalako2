import { motion } from 'framer-motion'

interface ProgressRingProps {
  size?: number
  strokeWidth?: number
  progress: number
  total: number
  color?: string
}

function lerpColor(a: string, b: string, t: number): string {
  const ah = parseInt(a.replace('#', ''), 16)
  const bh = parseInt(b.replace('#', ''), 16)
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff
  const rr = Math.round(ar + (br - ar) * t)
  const rg = Math.round(ag + (bg - ag) * t)
  const rb = Math.round(ab + (bb - ab) * t)
  return `#${((rr << 16) | (rg << 8) | rb).toString(16).padStart(6, '0')}`
}

function getTimerColor(ratio: number): string {
  if (ratio > 0.5) {
    return lerpColor('#34E4EA', '#FFB627', 1 - (ratio - 0.5) / 0.5)
  }
  return lerpColor('#FFB627', '#FF4444', 1 - ratio / 0.5)
}

export default function ProgressRing({
  size = 120,
  strokeWidth = 8,
  progress,
  total,
  color,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const fraction = Math.max(0, Math.min(1, progress / total))
  const offset = circumference * (1 - fraction)
  const displayColor = color ?? getTimerColor(fraction)

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
          style={{ filter: `drop-shadow(0 0 10px ${displayColor}50)` }}
        />
      </svg>
      <motion.span
        className="absolute text-3xl font-bold"
        style={{ fontFamily: 'var(--font-heading)' }}
        animate={{ color: displayColor }}
        transition={{ duration: 0.3 }}
      >
        {Math.ceil(progress)}
      </motion.span>
    </div>
  )
}
