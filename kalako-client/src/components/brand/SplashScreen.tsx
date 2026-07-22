import SvgDefs from './SvgDefs'
import { COLORS } from './theme'
import { useTranslation } from '@/i18n/context'

interface Props {
  className?: string
  showProgress?: boolean
}

export default function SplashScreen({ className, showProgress = true }: Props) {
  const t = useTranslation()
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1080 1920"
      className={className}
      role="img"
      aria-label={t.splashAria}
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <SvgDefs />
        <linearGradient id="splashBar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={COLORS.primary} />
          <stop offset="50%" stopColor={COLORS.secondary} />
          <stop offset="100%" stopColor={COLORS.success} />
        </linearGradient>
        <style>{`
          @keyframes floatA { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-30px) scale(1.06); } }
          @keyframes floatB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-50px,40px) scale(0.95); } }
          @keyframes floatC { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(20px,60px) scale(1.04); } }
          @keyframes floatD { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-30px,-20px) scale(0.92); } }
          .sflA { animation: floatA 14s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          .sflB { animation: floatB 18s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          .sflC { animation: floatC 22s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          .sflD { animation: floatD 16s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          @keyframes splashPulse { 0%,100% { transform: scale(1); filter: drop-shadow(0 0 20px #FF5DA2); } 50% { transform: scale(1.06); filter: drop-shadow(0 0 50px #FF5DA2); } }
          .splashLogo { animation: splashPulse 1.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          @keyframes splashSpin { to { transform: rotate(360deg); } }
          .splashRing { animation: splashSpin 6s linear infinite; transform-box: fill-box; transform-origin: center; }
          @keyframes splashBlink { 0%,80%,100% { opacity: 0.35; } 40% { opacity: 1; } }
          .sDot { animation: splashBlink 1.2s ease-in-out infinite; }
          .sDot1 { animation-delay: 0s; }
          .sDot2 { animation-delay: 0.18s; }
          .sDot3 { animation-delay: 0.36s; }
          @keyframes splashBar { 0% { transform: scaleX(0); } 50% { transform: scaleX(0.7); } 100% { transform: scaleX(1); } }
          .sBarFill { transform-box: fill-box; transform-origin: left center; animation: splashBar 2.4s ease-in-out infinite; }
        `}</style>
      </defs>

      <rect width={1080} height={1920} fill="url(#gradBg)" />
      <rect width={1080} height={1920} fill="url(#gradHaloSplash)" />

      <g opacity={0.6}>
        <ellipse className="sflA" cx={180} cy={320} rx={260} ry={230} fill={COLORS.primary} filter="url(#softBlob)" />
        <ellipse className="sflB" cx={900} cy={900} rx={300} ry={280} fill={COLORS.secondary} filter="url(#softBlob)" />
        <ellipse className="sflC" cx={220} cy={1500} rx={320} ry={260} fill={COLORS.success} filter="url(#softBlob)" />
        <ellipse className="sflD" cx={880} cy={1700} rx={280} ry={220} fill={COLORS.warning} filter="url(#softBlob)" />
      </g>

      <g opacity={0.85}>
        <circle cx={120} cy={780} r={3} fill="#FFFFFF" />
        <circle cx={320} cy={1200} r={2.5} fill="#FFFFFF" />
        <circle cx={780} cy={500} r={3} fill="#FFFFFF" />
        <circle cx={640} cy={1600} r={2.5} fill="#FFFFFF" />
        <circle cx={520} cy={900} r={2} fill="#FFFFFF" />
        <circle cx={940} cy={1280} r={3} fill="#FFFFFF" />
        <circle cx={260} cy={1700} r={2} fill="#FFFFFF" />
      </g>

      <g transform="translate(540, 820)" className="splashLogo">
        <circle r={240} fill="url(#gradHaloSplash)" />
        <g transform="translate(-110, -200)" filter="url(#glowAmber)">
          <path d="M0,52 L26,0 L52,38 L78,0 L104,52 Z M0,52 L104,52 L104,66 L0,66 Z" fill={COLORS.warning} stroke="#FFFFFF" strokeWidth={3} strokeLinejoin="round" />
          <circle cx={26} cy={0} r={8} fill={COLORS.primary} />
          <circle cx={52} cy={25} r={6} fill={COLORS.success} />
          <circle cx={78} cy={0} r={8} fill={COLORS.secondary} />
        </g>
        <g filter="url(#glowPink)">
          <text x={0} y={120} textAnchor="middle" fontWeight={900} fontSize={320} fill="url(#gradPinkPurple)" fontFamily="Cairo, Tajawal, 'Noto Sans Arabic', system-ui, sans-serif">؟</text>
        </g>
        <text x={0} y={260} textAnchor="middle" fontWeight={900} fontSize={64} fill="#FFFFFF" filter="url(#glowPink)" letterSpacing="-2" fontFamily="Cairo, Tajawal, 'Noto Sans Arabic', system-ui, sans-serif">تحدي الإجابات</text>
        <circle r={280} fill="none" stroke={COLORS.success} strokeWidth={2} strokeOpacity={0.4} className="splashRing" strokeDasharray="6 16" />
        <circle cx={280} cy={0} r={6} fill={COLORS.success} filter="url(#glowCyan)" />
      </g>

      <g transform="translate(540, 1480)">
        <circle cx={-44} cy={0} r={12} fill={COLORS.primary} filter="url(#glowPink)" className="sDot sDot1" />
        <circle cx={0} cy={0} r={12} fill={COLORS.secondary} filter="url(#glowPurple)" className="sDot sDot2" />
        <circle cx={44} cy={0} r={12} fill={COLORS.success} filter="url(#glowCyan)" className="sDot sDot3" />
      </g>

      <text x={540} y={1560} textAnchor="middle" fontWeight={700} fontSize={36} fill="#E6DEFF" opacity={0.85} fontFamily="Cairo, Tajawal, 'Noto Sans Arabic', system-ui, sans-serif">{t.loadingText}</text>

      {showProgress && (
        <g transform="translate(140, 1700)">
          <rect x={0} y={0} width={800} height={14} rx={7} fill={COLORS.bgEnd} stroke={COLORS.secondary} strokeWidth={2} strokeOpacity={0.6} />
          <rect x={0} y={0} width={800} height={14} rx={7} fill="url(#splashBar)" filter="url(#glowPink)" className="sBarFill" />
        </g>
      )}

      <text x={540} y={1800} textAnchor="middle" fontWeight={600} fontSize={24} fill="#FFFFFF" opacity={0.55} fontFamily="Cairo, Tajawal, 'Noto Sans Arabic', system-ui, sans-serif">{t.brandLabel}</text>
    </svg>
  )
}
