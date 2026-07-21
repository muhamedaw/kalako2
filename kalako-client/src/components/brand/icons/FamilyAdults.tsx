import { COLORS } from '../theme'

interface Props {
  size?: number
  className?: string
  variant?: 'family' | 'adults'
}

export default function FamilyAdults({ size = 64, className, variant = 'family' }: Props) {
  const isFamily = variant === 'family'
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} role="img" aria-label={isFamily ? 'عائلي' : 'كبار'}>
      <defs>
        <linearGradient id="faGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={COLORS.success} />
          <stop offset="100%" stopColor={COLORS.secondary} />
        </linearGradient>
        <filter id="faGlow">
          <feGaussianBlur stdDeviation="1.5" result="b" in="SourceGraphic" />
          <feFlood floodColor={COLORS.success} floodOpacity={0.7} />
          <feComposite in2="b" operator="in" result="g" />
          <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect x={2} y={2} width={60} height={60} rx={12} fill={COLORS.bgStart} stroke="url(#faGrad)" strokeWidth={2} filter="url(#faGlow)" />
      {isFamily ? (
        <>
          <circle cx={22} cy={18} r={7} fill={COLORS.success} filter="url(#faGlow)" />
          <path d="M14,34 Q14,24 22,24 Q30,24 30,34" fill={COLORS.success} filter="url(#faGlow)" />
          <circle cx={42} cy={16} r={6} fill={COLORS.secondary} filter="url(#faGlow)" />
          <path d="M36,28 Q36,20 42,20 Q48,20 48,28" fill={COLORS.secondary} filter="url(#faGlow)" />
          <circle cx={32} cy={14} r={5} fill={COLORS.primary} filter="url(#faGlow)" />
          <path d="M27,24 Q27,18 32,18 Q37,18 37,24" fill={COLORS.primary} filter="url(#faGlow)" />
          <line x1={20} y1={42} x2={28} y2={36} stroke={COLORS.success} strokeWidth={2} />
          <line x1={44} y1={40} x2={36} y2={34} stroke={COLORS.secondary} strokeWidth={2} />
          <line x1={30} y1={34} x2={34} y2={30} stroke={COLORS.primary} strokeWidth={2} />
          <rect x={14} y={44} width={14} height={16} rx={3} fill={COLORS.success} stroke="#FFFFFF" strokeWidth={1.5} opacity={0.8} />
          <rect x={36} y={44} width={14} height={16} rx={3} fill={COLORS.secondary} stroke="#FFFFFF" strokeWidth={1.5} opacity={0.8} />
          <rect x={25} y={42} width={14} height={14} rx={3} fill={COLORS.primary} stroke="#FFFFFF" strokeWidth={1.5} opacity={0.8} />
        </>
      ) : (
        <>
          <circle cx={20} cy={22} r={8} fill={COLORS.success} filter="url(#faGlow)" />
          <path d="M10,42 Q10,28 20,28 Q30,28 30,42" fill={COLORS.success} filter="url(#faGlow)" />
          <circle cx={44} cy={22} r={8} fill={COLORS.secondary} filter="url(#faGlow)" />
          <path d="M34,42 Q34,28 44,28 Q54,28 54,42" fill={COLORS.secondary} filter="url(#faGlow)" />
          {[20, 44].map((cx) => (
            <g key={cx}>
              <rect x={cx - 4} y={42} width={8} height={18} rx={3} fill={cx === 20 ? COLORS.success : COLORS.secondary} stroke="#FFFFFF" strokeWidth={1.5} opacity={0.8} />
              <line x1={cx - 6} y1={46} x2={cx + 6} y2={46} stroke="#FFFFFF" strokeWidth={1} opacity={0.5} />
              <line x1={cx - 6} y1={52} x2={cx + 6} y2={52} stroke="#FFFFFF" strokeWidth={1} opacity={0.5} />
            </g>
          ))}
        </>
      )}
    </svg>
  )
}
