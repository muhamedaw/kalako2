import SvgDefs from './SvgDefs'
import { AVATAR_CONFIGS, type AvatarState, COLORS } from './theme'
import { useMemo } from 'react'

interface Props {
  id: number
  state?: AvatarState
  size?: number
  className?: string
}

function Eyes({ x, y, state }: { x: number; y: number; state: AvatarState }) {
  if (state === 'happy') {
    return (
      <>
        <path d={`M${x - 32},${y} Q${x - 22},${y + 12} ${x - 12},${y}`} stroke="#1B0E2E" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d={`M${x + 12},${y} Q${x + 22},${y + 12} ${x + 32},${y}`} stroke="#1B0E2E" strokeWidth={6} fill="none" strokeLinecap="round" />
      </>
    )
  }
  const eyeR = state === 'tricked' ? 22 : 18
  const pupilR = state === 'tricked' ? 10 : 9
  return (
    <>
      <ellipse cx={x - 22} cy={y} rx={eyeR} ry={eyeR + 2} fill="#FFFFFF" />
      <circle cx={x - 22} cy={y + 2} r={pupilR} fill="#1B0E2E" />
      <circle cx={x - 20} cy={y - 4} r={3} fill="#FFFFFF" />
      <ellipse cx={x + 22} cy={y} rx={eyeR} ry={eyeR + 2} fill="#FFFFFF" />
      <circle cx={x + 22} cy={y + 2} r={pupilR} fill="#1B0E2E" />
      <circle cx={x + 24} cy={y - 4} r={3} fill="#FFFFFF" />
    </>
  )
}

function Mouth({ x, y, state }: { x: number; y: number; state: AvatarState }) {
  if (state === 'happy') {
    return (
      <>
        <path d={`M${x - 50},${y} Q${x},${y + 62} ${x + 50},${y}`} fill="#1B0E2E" />
        <rect x={x - 40} y={y + 24} width={80} height={14} fill="#FFFFFF" rx={2} />
      </>
    )
  }
  if (state === 'tricked') {
    return <ellipse cx={x} cy={y + 10} rx={16} ry={22} fill="#1B0E2E" />
  }
  return <path d={`M${x - 30},${y} Q${x},${y + 22} ${x + 30},${y}`} stroke="#1B0E2E" strokeWidth={6} fill="none" strokeLinecap="round" />
}

export default function Avatar({ id, state = 'idle', size = 720, className }: Props) {
  const cx = size / 2
  const cy = size / 2
  const scale = size / 720
  const cfg = AVATAR_CONFIGS[(id - 1) % AVATAR_CONFIGS.length]
  const ringColor = state === 'tricked' ? COLORS.warning : state === 'happy' ? COLORS.success : COLORS.success
  const filterId = state === 'tricked' ? 'glowAmber' : state === 'happy' ? 'glowCyan' : 'glowPurple'
  const blushOpacity = state === 'happy' ? 0.6 : 0.45

  const sparks = useMemo(() => {
    if (state !== 'happy') return null
    return (
      <>
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${cx + (i % 2 === 0 ? -210 : 210)}, ${cy + (i < 2 ? -140 : 180)})`} filter="url(#glowCyan)" style={{ animation: `sparkle 0.7s ease-in-out infinite`, animationDelay: `${i * 0.18}s` }}>
            <rect x={-2} y={-14} width={4} height={28} rx={2} fill={COLORS.success} />
            <rect x={-14} y={-2} width={28} height={4} rx={2} fill={COLORS.success} />
            <circle cx={0} cy={0} r={3} fill="#FFFFFF" />
          </g>
        ))}
      </>
    )
  }, [state, cx, cy])

  const bolts = useMemo(() => {
    if (state !== 'tricked') return null
    return (
      <>
        <path d={`M${cx - 200},${cy - 120} L${cx - 170},${cy - 160} L${cx - 185},${cy - 120} L${cx - 155},${cy - 170} L${cx - 200},${cy - 90} L${cx - 185},${cy - 125} L${cx - 205},${cy - 125} Z`} fill={COLORS.warning} stroke="#FFFFFF" strokeWidth={2} strokeLinejoin="round" filter="url(#glowAmber)" style={{ animation: 'flash 0.4s ease-in-out infinite' }} />
        <path d={`M${cx + 165},${cy - 190} L${cx + 195},${cy - 230} L${cx + 180},${cy - 195} L${cx + 210},${cy - 240} L${cx + 165},${cy - 160} L${cx + 180},${cy - 195} L${cx + 160},${cy - 195} Z`} fill={COLORS.warning} stroke="#FFFFFF" strokeWidth={2} strokeLinejoin="round" filter="url(#glowAmber)" style={{ animation: 'flash 0.4s ease-in-out infinite', animationDelay: '0.2s' }} />
        <g transform={`translate(${cx},${cy - 230})`} filter="url(#glowAmber)" style={{ animation: 'spinSlow 1.6s linear infinite', transformOrigin: 'center' }}>
          <circle cx={-22} cy={0} r={4} fill="#FFFFFF" />
          <circle cx={22} cy={0} r={4} fill="#FFFFFF" />
          <rect x={-3} y={-15} width={6} height={14} rx={2} fill={COLORS.warning} />
          <rect x={-3} y={2} width={6} height={14} rx={2} fill={COLORS.warning} />
          <rect x={-15} y={-3} width={14} height={6} rx={2} fill={COLORS.warning} />
          <rect x={2} y={-3} width={14} height={6} rx={2} fill={COLORS.warning} />
        </g>
      </>
    )
  }, [state, cx, cy])

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`تحدي الإجابات player avatar ${String(id).padStart(2, '0')} — ${state} state`}
    >
      <defs>
        <SvgDefs />
        <style>{`
          @keyframes bob { 0%,100% { transform: translate(0,0); } 50% { transform: translate(0,-${scale * 4}px); } }
          @keyframes hop {
            0%,100% { transform: translate(0,0); }
            20% { transform: translate(0,${-22 * scale}px) scale(1.04,0.96); }
            40% { transform: translate(0,0) scale(0.98,1.02); }
            60% { transform: translate(0,${-10 * scale}px) scale(1.02,0.98); }
            80% { transform: translate(0,0); }
          }
          @keyframes shake {
            0%,100% { transform: translate(0,0) rotate(0deg); }
            20% { transform: translate(${-6 * scale}px,${-2 * scale}px) rotate(-3deg); }
            40% { transform: translate(${5 * scale}px,${3 * scale}px) rotate(3deg); }
            60% { transform: translate(${-4 * scale}px,${1 * scale}px) rotate(-2deg); }
            80% { transform: translate(${4 * scale}px,${-2 * scale}px) rotate(2deg); }
          }
          @keyframes sparkle { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
          @keyframes flash { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
          @keyframes spinSlow { to { transform: rotate(360deg); } }
          @keyframes pulseRing { 0%,100% { stroke-opacity: 0.85; } 50% { stroke-opacity: 1; } }
          .avatar-body { animation: ${state === 'happy' ? 'hop' : state === 'tricked' ? 'shake' : 'bob'} ${state === 'happy' ? '1.1s' : state === 'tricked' ? '0.7s' : '2s'} ${state === 'happy' ? 'cubic-bezier(.5,1.6,.4,1)' : 'linear'} infinite; transform-box: fill-box; transform-origin: center; }
          .ring { animation: pulseRing 2.4s ease-in-out infinite alternate; }
        `}</style>
      </defs>

      {sparks}
      {bolts}

      <g className="avatar-body">
        <circle cx={cx} cy={cy + 10 * scale} r={198 * scale} fill="none" stroke={ringColor} className="ring" strokeWidth={6 * scale} opacity={0.9} filter={`url(#${filterId})`} />
        <path d={`M${cx - 160 * scale},${cy - 40 * scale} Q${cx - 180 * scale},${cy - 160 * scale} ${cx},${cy - 190 * scale} Q${cx + 180 * scale},${cy - 160 * scale} ${cx + 160 * scale},${cy - 40 * scale} L${cx - 160 * scale},${cy - 30 * scale} Z`} fill={cfg.hair} filter="url(#glowPurple)" />
        <path d={`M${cx + 170 * scale},${cy - 60 * scale} Q${cx + 260 * scale},${cy + 40 * scale} ${cx + 220 * scale},${cy + 180 * scale} Q${cx + 170 * scale},${cy + 130 * scale} ${cx + 150 * scale},${cy} Z`} fill={cfg.hair} filter="url(#glowPurple)" />

        <circle cx={cx} cy={cy} r={180 * scale} fill={cfg.skin} />
        <ellipse cx={cx - 176.4 * scale} cy={cy + 10 * scale} rx={14 * scale} ry={22 * scale} fill={cfg.skin} />
        <ellipse cx={cx + 176.4 * scale} cy={cy + 10 * scale} rx={14 * scale} ry={22 * scale} fill={cfg.skin} />

        <ellipse cx={cx - 99 * scale} cy={cy + 57.6 * scale} rx={28 * scale} ry={16 * scale} fill={COLORS.primary} opacity={blushOpacity} />
        <ellipse cx={cx + 99 * scale} cy={cy + 57.6 * scale} rx={28 * scale} ry={16 * scale} fill={COLORS.primary} opacity={blushOpacity} />

        <Eyes x={cx} y={cy - 25 * scale} state={state} />
        <Mouth x={cx} y={cy + 70 * scale} state={state} />
      </g>
    </svg>
  )
}
