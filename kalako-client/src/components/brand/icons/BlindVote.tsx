import { COLORS } from '../theme'

interface Props {
  size?: number
  className?: string
}

export default function BlindVote({ size = 64, className }: Props) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} role="img" aria-label="تصويت أعمى">
      <defs>
        <linearGradient id="bvGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={COLORS.secondary} />
          <stop offset="100%" stopColor={COLORS.success} />
        </linearGradient>
        <filter id="bvGlow">
          <feGaussianBlur stdDeviation="1.5" result="b" in="SourceGraphic" />
          <feFlood floodColor={COLORS.secondary} floodOpacity={0.8} />
          <feComposite in2="b" operator="in" result="g" />
          <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect x={2} y={2} width={60} height={60} rx={12} fill={COLORS.bgStart} stroke="url(#bvGrad)" strokeWidth={2} filter="url(#bvGlow)" />
      <ellipse cx={32} cy={20} rx={20} ry={12} fill="none" stroke={COLORS.success} strokeWidth={2.5} filter="url(#bvGlow)" />
      <circle cx={32} cy={20} r={5} fill={COLORS.success} filter="url(#bvGlow)" />
      <rect x={14} y={36} width={36} height={20} rx={4} fill="none" stroke={COLORS.secondary} strokeWidth={2.5} filter="url(#bvGlow)" />
      <line x1={20} y1={44} x2={44} y2={44} stroke={COLORS.secondary} strokeWidth={2} />
      <line x1={32} y1={36} x2={32} y2={56} stroke={COLORS.secondary} strokeWidth={2} />
      <circle cx={32} cy={20} r={20} fill="none" stroke={COLORS.warning} strokeWidth={1.5} strokeDasharray="3 3" opacity={0.7} />
      <line x1={12} y1={8} x2={52} y2={34} stroke={COLORS.warning} strokeWidth={2.5} strokeLinecap="round" filter="url(#bvGlow)" />
    </svg>
  )
}
