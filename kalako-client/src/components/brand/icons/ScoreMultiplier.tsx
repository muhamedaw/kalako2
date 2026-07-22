import { COLORS } from '../theme'
import { useTranslation } from '@/i18n/context'

interface Props {
  size?: number
  className?: string
}

export default function ScoreMultiplier({ size = 64, className }: Props) {
  const t = useTranslation()
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} role="img"         aria-label={t.scoreMultiplierAria}>
      <defs>
        <linearGradient id="smGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={COLORS.primary} />
          <stop offset="100%" stopColor={COLORS.warning} />
        </linearGradient>
        <filter id="smGlow">
          <feGaussianBlur stdDeviation="1.5" result="b" in="SourceGraphic" />
          <feFlood floodColor={COLORS.warning} floodOpacity={0.8} />
          <feComposite in2="b" operator="in" result="g" />
          <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect x={2} y={2} width={60} height={60} rx={12} fill={COLORS.bgStart} stroke="url(#smGrad)" strokeWidth={2} filter="url(#smGlow)" />
      <polygon points="32,8 38,24 56,24 42,34 47,52 32,42 17,52 22,34 8,24 26,24" fill="url(#smGrad)" filter="url(#smGlow)" />
      <text x={32} y={44} textAnchor="middle" fill="#FFFFFF" fontFamily="Cairo, sans-serif" fontWeight={900} fontSize={22} filter="url(#smGlow)">2×</text>
    </svg>
  )
}
