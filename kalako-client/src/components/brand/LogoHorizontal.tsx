import SvgDefs from './SvgDefs'
import { COLORS } from './theme'

interface Props {
  width?: number
  height?: number
  className?: string
}

export default function LogoHorizontal({ width = 1200, height = 360, className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 360"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="تحدي الإجابات — Neon Party trivia game logo"
    >
      <SvgDefs />
      <circle cx={190} cy={180} r={170} fill="url(#gradHaloSplash)" />
      <g filter="url(#glowPink)">
        <rect x={60} y={60} width={240} height={240} rx={44} ry={44} fill="url(#gradPurplePink)" stroke={COLORS.primary} strokeWidth={2} />
        <rect x={70} y={70} width={220} height={220} rx={34} ry={34} fill="none" stroke="#FFFFFF" strokeOpacity={0.12} strokeWidth={1} />
        <text x={180} y={230} textAnchor="middle" fontFamily="Cairo, Tajawal, 'Noto Sans Arabic', system-ui, sans-serif" fontWeight={900} fontSize={180} fill="#FFFFFF" letterSpacing="-6">؟</text>
        <circle cx={108} cy={116} r={5} fill={COLORS.success} filter="url(#glowCyan)" />
        <circle cx={260} cy={260} r={4} fill={COLORS.warning} filter="url(#glowAmber)" />
        <circle cx={116} cy={260} r={3} fill="#FFFFFF" opacity={0.9} />
      </g>
      <g transform="translate(140,30)" filter="url(#glowAmber)">
        <path d="M0,40 L20,0 L40,30 L60,0 L80,40 Z M0,40 L80,40 L80,52 L0,52 Z" fill={COLORS.warning} stroke="#FFFFFF" strokeWidth={2} strokeLinejoin="round" />
        <circle cx={20} cy={0} r={6} fill={COLORS.primary} />
        <circle cx={40} cy={20} r={5} fill={COLORS.success} />
        <circle cx={60} cy={0} r={6} fill={COLORS.secondary} />
      </g>
      <g filter="url(#glowPink)">
        <text x={380} y={200} fontFamily="Cairo, Tajawal, 'Noto Sans Arabic', system-ui, sans-serif" fontWeight={900} fontSize={120} fill="url(#gradPinkPurple)" letterSpacing="-2">تحدي الإجابات</text>
      </g>
      <text x={380} y={260} fontFamily="Cairo, Tajawal, 'Noto Sans Arabic', system-ui, sans-serif" fontWeight={600} fontSize={34} fill="#E6DEFF" opacity={0.85}>لعبة خداع جماعية • Fibbage-style</text>
      <g filter="url(#glowCyan)">
        <rect x={380} y={280} width={160} height={6} rx={3} fill={COLORS.success} />
      </g>
      <rect x={550} y={280} width={60} height={6} rx={3} fill={COLORS.primary} opacity={0.7} />
    </svg>
  )
}
