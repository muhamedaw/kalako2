import { COLORS } from './theme'

interface Props {
  className?: string
  animated?: boolean
}

export default function LobbyBackground({ className, animated = true }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1080 1920"
      className={className}
      role="img"
      aria-label="Lobby background for تحدي الإجابات"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.bgStart} />
          <stop offset="100%" stopColor={COLORS.bgEnd} />
        </linearGradient>
        <filter id="bgBlob" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="28" result="b" in="SourceGraphic" />
          <feFlood floodColor={COLORS.secondary} floodOpacity={0.55} />
          <feComposite in2="b" operator="in" result="g" />
          <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {animated && (
        <style>{`
          @keyframes floatA { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-30px) scale(1.06); } }
          @keyframes floatB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-50px,40px) scale(0.95); } }
          @keyframes floatC { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(20px,60px) scale(1.04); } }
          @keyframes floatD { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-30px,-20px) scale(0.92); } }
          @keyframes twinkle { 0%,100% { opacity: 0.35; } 50% { opacity: 1; } }
          .flA { animation: floatA 14s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          .flB { animation: floatB 18s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          .flC { animation: floatC 22s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          .flD { animation: floatD 16s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          .star { animation: twinkle 3s ease-in-out infinite; }
          .s2 { animation-delay: 0.8s; }
          .s3 { animation-delay: 1.4s; }
          .s4 { animation-delay: 2.1s; }
        `}</style>
      )}
      <rect width={1080} height={1920} fill="url(#bgGrad)" />
      <g filter="url(#bgBlob)" opacity={0.55}>
        <ellipse className={animated ? 'flA' : ''} cx={180} cy={320} rx={260} ry={230} fill={COLORS.primary} />
      </g>
      <g filter="url(#bgBlob)" opacity={0.6}>
        <ellipse className={animated ? 'flB' : ''} cx={900} cy={900} rx={300} ry={280} fill={COLORS.secondary} />
      </g>
      <g filter="url(#bgBlob)" opacity={0.5}>
        <ellipse className={animated ? 'flC' : ''} cx={220} cy={1500} rx={320} ry={260} fill={COLORS.success} />
      </g>
      <g filter="url(#bgBlob)" opacity={0.45}>
        <ellipse className={animated ? 'flD' : ''} cx={880} cy={1700} rx={280} ry={220} fill={COLORS.warning} />
      </g>
      <g>
        <circle className="star" cx={120} cy={780} r={3} fill="#FFFFFF" />
        <circle className="star s2" cx={320} cy={1200} r={2.5} fill="#FFFFFF" />
        <circle className="star s3" cx={780} cy={500} r={3} fill="#FFFFFF" />
        <circle className="star s4" cx={640} cy={1600} r={2.5} fill="#FFFFFF" />
        <circle className="star" cx={520} cy={900} r={2} fill="#FFFFFF" />
        <circle className="star s2" cx={940} cy={1280} r={3} fill="#FFFFFF" />
        <circle className="star s3" cx={260} cy={1700} r={2} fill="#FFFFFF" />
      </g>
      <g opacity={0.06} stroke="#FFFFFF" strokeWidth={1}>
        {Array.from({ length: 16 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={(i + 1) * 120} x2={1080} y2={(i + 1) * 120} />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`v${i}`} x1={(i + 1) * 120} y1={0} x2={(i + 1) * 120} y2={1920} />
        ))}
      </g>
    </svg>
  )
}
