import { COLORS } from './theme'

interface Props {
  roomCode?: string
  width?: number
  height?: number
}

export default function OGImage({ roomCode, width = 1200, height = 630 }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="تحدي الإجابات — invite preview"
    >
      <defs>
        <linearGradient id="ogBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.bgStart} />
          <stop offset="100%" stopColor={COLORS.bgEnd} />
        </linearGradient>
        <linearGradient id="ogPinkPurple" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={COLORS.primary} />
          <stop offset="100%" stopColor={COLORS.secondary} />
        </linearGradient>
        <linearGradient id="ogPurplePink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={COLORS.secondary} />
          <stop offset="100%" stopColor={COLORS.primary} />
        </linearGradient>
        <linearGradient id="ogCode" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={COLORS.bgEnd} />
          <stop offset="100%" stopColor="#2A1758" />
        </linearGradient>
        <filter id="ogGlowPink" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.5" result="b" in="SourceGraphic" />
          <feFlood floodColor={COLORS.primary} floodOpacity={0.9} />
          <feComposite in2="b" operator="in" result="glow" />
          <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="ogGlowCyan" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2" result="b" in="SourceGraphic" />
          <feFlood floodColor={COLORS.success} floodOpacity={0.9} />
          <feComposite in2="b" operator="in" result="glow" />
          <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="ogGlowAmber" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.5" result="b" in="SourceGraphic" />
          <feFlood floodColor={COLORS.warning} floodOpacity={0.9} />
          <feComposite in2="b" operator="in" result="glow" />
          <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="ogBlob" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="28" result="b" in="SourceGraphic" />
          <feFlood floodColor={COLORS.secondary} floodOpacity={0.55} />
          <feComposite in2="b" operator="in" result="g" />
          <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect x={0} y={0} width={width} height={height} fill="url(#ogBg)" />
      <g filter="url(#ogBlob)" opacity={0.55}>
        <ellipse cx={160} cy={100} rx={220} ry={160} fill={COLORS.primary} />
        <ellipse cx={1080} cy={540} rx={240} ry={180} fill={COLORS.secondary} />
        <ellipse cx={980} cy={90} rx={160} ry={120} fill={COLORS.success} />
      </g>

      <g opacity={0.05} stroke="#FFFFFF" strokeWidth={1}>
        {Array.from({ length: 7 }, (_, i) => (<line key={`h${i}`} x1={0} y1={(i + 1) * 80} x2={1200} y2={(i + 1) * 80} />))}
        {Array.from({ length: 14 }, (_, i) => (<line key={`v${i}`} x1={(i + 1) * 80} y1={0} x2={(i + 1) * 80} y2={630} />))}
      </g>

      <g transform="translate(80, 180)" filter="url(#ogGlowPink)">
        <rect x={0} y={0} width={180} height={180} rx={34} ry={34} fill="url(#ogPurplePink)" stroke={COLORS.primary} strokeWidth={2} />
        <rect x={8} y={8} width={164} height={164} rx={26} ry={26} fill="none" stroke="#FFFFFF" strokeOpacity={0.14} />
        <text x={90} y={128} textAnchor="middle" fontFamily="Cairo, Tajawal, 'Noto Sans Arabic', system-ui, sans-serif" fontWeight={900} fontSize={135} fill="#FFFFFF" letterSpacing="-4">؟</text>
      </g>
      <g transform="translate(120, 80)" filter="url(#ogGlowAmber)">
        <path d="M0,30 L14,0 L28,22 L42,0 L56,30 Z M0,30 L56,30 L56,38 L0,38 Z" fill={COLORS.warning} stroke="#FFFFFF" strokeWidth={2} strokeLinejoin="round" />
        <circle cx={14} cy={0} r={4} fill={COLORS.primary} />
        <circle cx={28} cy={14} r={3} fill={COLORS.success} />
        <circle cx={42} cy={0} r={4} fill={COLORS.secondary} />
      </g>
      <g filter="url(#ogGlowPink)">
        <text x={80} y={420} fontFamily="Cairo, Tajawal, 'Noto Sans Arabic', system-ui, sans-serif" fontWeight={900} fontSize={86} fill="url(#ogPinkPurple)" letterSpacing="-2">تحدي الإجابات</text>
      </g>
      <text x={80} y={476} fontFamily="Cairo, Tajawal, 'Noto Sans Arabic', system-ui, sans-serif" fontWeight={600} fontSize={28} fill="#E6DEFF" opacity={0.85}>لعبة خداع جماعية • ادعُ ربعك!</text>
      <rect x={80} y={510} width={120} height={6} rx={3} fill={COLORS.success} filter="url(#ogGlowCyan)" />
      <rect x={210} y={510} width={60} height={6} rx={3} fill={COLORS.primary} opacity={0.7} />

      <g transform="translate(640, 180)">
        <text x={0} y={0} fontFamily="Cairo, Tajawal, 'Noto Sans Arabic', system-ui, sans-serif" fontWeight={900} fontSize={34} fill={COLORS.warning} filter="url(#ogGlowAmber)">كود الغرفة</text>
        <g filter="url(#ogGlowPink)">
          <rect x={0} y={30} width={480} height={200} rx={28} ry={28} fill="url(#ogCode)" stroke={COLORS.primary} strokeWidth={3} strokeDasharray="14 10" />
        </g>
        <text x={240} y={155} textAnchor="middle" fontFamily="Cairo, Tajawal, 'Noto Sans Arabic', system-ui, sans-serif" fontWeight={900} fontSize={roomCode ? 84 : 84} fill="#FFFFFF" opacity={roomCode ? 1 : 0.45} letterSpacing="6">{roomCode ?? '------'}</text>
        <text x={0} y={278} fontFamily="Cairo, Tajawal, 'Noto Sans Arabic', system-ui, sans-serif" fontWeight={700} fontSize={22} fill="#E6DEFF" opacity={0.9}>kalako.app/join</text>
        <g filter="url(#ogGlowCyan)">
          <rect x={0} y={295} width={160} height={5} rx={2.5} fill={COLORS.success} />
        </g>
        <rect x={170} y={295} width={80} height={5} rx={2.5} fill={COLORS.primary} opacity={0.7} />
      </g>

      <circle cx={60} cy={600} r={4} fill={COLORS.success} filter="url(#ogGlowCyan)" />
      <circle cx={1130} cy={50} r={4} fill={COLORS.primary} filter="url(#ogGlowPink)" />
      <circle cx={110} cy={55} r={3} fill="#FFFFFF" opacity={0.85} />
      <circle cx={1110} cy={600} r={3} fill={COLORS.warning} filter="url(#ogGlowAmber)" />
    </svg>
  )
}
