import SvgDefs from './SvgDefs'
import { COLORS } from './theme'

interface Props {
  width?: number
  height?: number
  className?: string
}

export default function LogoSquare({ width = 512, height = 512, className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="تحدي الإجابات — app icon"
    >
      <SvgDefs />
      <rect x={0} y={0} width={512} height={512} rx={120} ry={120} fill="url(#gradBg)" />
      <rect x={0} y={0} width={512} height={512} rx={120} ry={120} fill="url(#gradHaloSplash)" />
      <g transform="translate(176,80)" filter="url(#glowAmber)">
        <path d="M0,52 L26,0 L52,38 L78,0 L104,52 Z M0,52 L104,52 L104,66 L0,66 Z" fill={COLORS.warning} stroke="#FFFFFF" strokeWidth={3} strokeLinejoin="round" />
        <circle cx={26} cy={0} r={8} fill={COLORS.primary} />
        <circle cx={52} cy={25} r={6} fill={COLORS.success} />
        <circle cx={78} cy={0} r={8} fill={COLORS.secondary} />
      </g>
      <g filter="url(#glowPink)">
        <text x={256} y={340} textAnchor="middle" fontFamily="Cairo, Tajawal, 'Noto Sans Arabic', system-ui, sans-serif" fontWeight={900} fontSize={280} fill="url(#gradPinkPurple)">؟</text>
      </g>
      <text x={256} y={446} textAnchor="middle" fontFamily="Cairo, Tajawal, 'Noto Sans Arabic', system-ui, sans-serif" fontWeight={900} fontSize={56} fill="#FFFFFF" filter="url(#glowPink)" letterSpacing="-1">تحدي الإجابات</text>
      <g filter="url(#glowCyan)">
        <circle cx={86} cy={102} r={9} fill={COLORS.success} />
      </g>
      <g filter="url(#glowAmber)">
        <circle cx={430} cy={380} r={7} fill={COLORS.warning} />
      </g>
      <circle cx={430} cy={120} r={5} fill="#FFFFFF" opacity={0.9} />
      <circle cx={80} cy={380} r={5} fill="#FFFFFF" opacity={0.7} />
    </svg>
  )
}
