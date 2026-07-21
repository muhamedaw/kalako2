import { COLORS } from '../theme'

interface Props {
  size?: number
  className?: string
}

export default function MostDeceptive({ size = 72, className }: Props) {
  return (
    <svg viewBox="0 0 72 72" width={size} height={size} className={className} role="img" aria-label="الأكثر خداعًا">
      <defs>
        <linearGradient id="mdGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={COLORS.warning} />
          <stop offset="100%" stopColor={COLORS.primary} />
        </linearGradient>
        <filter id="mdGlow">
          <feGaussianBlur stdDeviation="2" result="b" in="SourceGraphic" />
          <feFlood floodColor={COLORS.warning} floodOpacity={0.8} />
          <feComposite in2="b" operator="in" result="g" />
          <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect x={2} y={2} width={68} height={68} rx={14} fill={COLORS.bgStart} stroke="url(#mdGrad)" strokeWidth={2.5} filter="url(#mdGlow)" />
      {/* fox face */}
      <polygon points="36,16 20,8 14,28 36,34" fill={COLORS.warning} filter="url(#mdGlow)" />
      <polygon points="36,16 52,8 58,28 36,34" fill={COLORS.warning} filter="url(#mdGlow)" />
      <ellipse cx={36} cy={34} rx={18} ry={14} fill={COLORS.warning} />
      <ellipse cx={36} cy={36} rx={14} ry={11} fill={COLORS.bgEnd} />
      <circle cx={29} cy={34} r={3} fill="#FFFFFF" />
      <circle cx={43} cy={34} r={3} fill="#FFFFFF" />
      <circle cx={29} cy={34} r={1.5} fill={COLORS.bgStart} />
      <circle cx={43} cy={34} r={1.5} fill={COLORS.bgStart} />
      <ellipse cx={36} cy={41} rx={4} ry={2.5} fill={COLORS.primary} />
      {/* crown */}
      <path d="M24,4 L28,14 L36,6 L44,14 L48,4 L48,16 L24,16 Z" fill={COLORS.warning} stroke="#FFFFFF" strokeWidth={1} filter="url(#mdGlow)" />
      <circle cx={28} cy={14} r={2} fill={COLORS.success} />
      <circle cx={36} cy={6} r={2} fill={COLORS.primary} />
      <circle cx={44} cy={14} r={2} fill={COLORS.success} />
    </svg>
  )
}
