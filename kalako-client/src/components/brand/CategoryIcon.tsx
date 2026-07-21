import SvgDefs from './SvgDefs'
import { COLORS, CATEGORIES } from './theme'

interface Props {
  categoryId: string
  size?: number
  className?: string
}

function CategoryGlyph({ id, cx, cy, r }: { id: string; cx: number; cy: number; r: number }) {
  switch (id) {
    case 'celebrities':
      return (
        <g transform={`translate(${cx},${cy})`}>
          <polygon points={`0,${-r * 0.97} ${r * 0.23},${-r * 0.3} ${r * 0.92},${-r * 0.3} ${r * 0.37},${r * 0.12} ${r * 0.6},${r * 0.8} 0,${r * 0.39} ${-r * 0.6},${r * 0.8} ${-r * 0.37},${r * 0.12} ${-r * 0.92},${-r * 0.3} ${-r * 0.23},${-r * 0.3}`} fill={COLORS.warning} stroke="#FFFFFF" strokeWidth={r * 0.05} strokeLinejoin="round" />
          <circle cx={0} cy={0} r={r * 0.14} fill="#FFFFFF" />
          <g transform={`translate(${r * 0.84},${-r * 0.84})`}>
            <rect x={-r * 0.015} y={-r * 0.13} width={r * 0.03} height={r * 0.26} rx={r * 0.015} fill="#FFFFFF" />
            <rect x={-r * 0.13} y={-r * 0.015} width={r * 0.26} height={r * 0.03} rx={r * 0.015} fill="#FFFFFF" />
            <circle cx={0} cy={0} r={r * 0.02} fill="#FFFFFF" />
          </g>
        </g>
      )
    case 'cooking':
      return (
        <g transform={`translate(${cx},${cy})`}>
          <ellipse cx={-r * 0.32} cy={-r * 0.39} rx={r * 0.39} ry={r * 0.39} fill="#FFFFFF" stroke={COLORS.primary} strokeWidth={r * 0.065} />
          <ellipse cx={r * 0.38} cy={-r * 0.32} rx={r * 0.38} ry={r * 0.38} fill="#FFFFFF" stroke={COLORS.primary} strokeWidth={r * 0.065} />
          <ellipse cx={0} cy={-r * 0.65} rx={r * 0.36} ry={r * 0.36} fill="#FFFFFF" stroke={COLORS.primary} strokeWidth={r * 0.065} />
          <rect x={-r * 0.84} y={0} width={r * 1.68} height={r * 0.78} rx={r * 0.09} fill="#FFFFFF" stroke={COLORS.primary} strokeWidth={r * 0.09} />
          <line x1={-r * 0.65} y1={r * 0.26} x2={r * 0.65} y2={r * 0.26} stroke={COLORS.primary} strokeWidth={r * 0.04} />
          <circle cx={-r * 0.45} cy={r * 0.39} r={r * 0.04} fill={COLORS.warning} />
          <circle cx={0} cy={r * 0.39} r={r * 0.04} fill={COLORS.warning} />
          <circle cx={r * 0.45} cy={r * 0.39} r={r * 0.04} fill={COLORS.warning} />
        </g>
      )
    case 'films':
      return (
        <g transform={`translate(${cx},${cy})`}>
          <rect x={-r * 0.94} y={-r * 0.65} width={r * 1.88} height={r * 1.3} rx={r * 0.065} fill="#FFFFFF" stroke={COLORS.secondary} strokeWidth={r * 0.065} />
          <circle cx={0} cy={0} r={r * 0.39} fill={COLORS.secondary} />
          <polygon points={`${r * 0.14},0 ${r * 0.45},${-r * 0.32} ${r * 0.45},${r * 0.32}`} fill="#FFFFFF" />
          <g transform={`translate(${-r * 0.65},${-r * 0.32})`}>
            <rect x={-r * 0.02} y={-r * 0.14} width={r * 0.04} height={r * 0.28} rx={r * 0.02} fill="#FFFFFF" />
            <rect x={-r * 0.14} y={-r * 0.02} width={r * 0.28} height={r * 0.04} rx={r * 0.02} fill="#FFFFFF" />
          </g>
          <g transform={`translate(${r * 0.65},${-r * 0.32})`}>
            <rect x={-r * 0.02} y={-r * 0.14} width={r * 0.04} height={r * 0.28} rx={r * 0.02} fill="#FFFFFF" />
            <rect x={-r * 0.14} y={-r * 0.02} width={r * 0.28} height={r * 0.04} rx={r * 0.02} fill="#FFFFFF" />
          </g>
        </g>
      )
    case 'geography':
      return (
        <g transform={`translate(${cx},${cy})`}>
          <circle cx={0} cy={0} r={r} fill="#FFFFFF" stroke={COLORS.success} strokeWidth={r * 0.09} />
          <ellipse cx={0} cy={0} rx={r} ry={r * 0.39} fill="none" stroke={COLORS.secondary} strokeWidth={r * 0.05} />
          <line x1={0} y1={-r} x2={0} y2={r} stroke={COLORS.secondary} strokeWidth={r * 0.05} />
          <ellipse cx={0} cy={0} rx={r * 0.52} ry={r} fill="none" stroke={COLORS.primary} strokeWidth={r * 0.05} />
          <line x1={-r} y1={0} x2={r} y2={0} stroke={COLORS.primary} strokeWidth={r * 0.05} />
          <circle cx={-r * 0.32} cy={-r * 0.32} r={r * 0.09} fill={COLORS.primary} />
          <circle cx={r * 0.39} cy={r * 0.19} r={r * 0.09} fill={COLORS.primary} />
        </g>
      )
    case 'history':
      return (
        <g transform={`translate(${cx},${cy})`}>
          <rect x={-r * 0.32} y={-r * 0.97} width={r * 0.65} height={r * 1.94} rx={r * 0.065} fill="#FFFFFF" stroke={COLORS.warning} strokeWidth={r * 0.065} />
          <circle cx={0} cy={-r * 0.13} r={r * 0.13} fill={COLORS.warning} />
          <path d={`M${-r * 0.58},${r * 0.13} L${r * 0.58},${r * 0.13}`} stroke="#FFFFFF" strokeWidth={r * 0.04} strokeLinecap="round" />
          <path d={`M${-r * 0.58},${r * 0.32} L${r * 0.58},${r * 0.32}`} stroke="#FFFFFF" strokeWidth={r * 0.04} strokeLinecap="round" />
          <path d={`M${-r * 0.58},${r * 0.52} L${r * 0.39},${r * 0.52}`} stroke="#FFFFFF" strokeWidth={r * 0.04} strokeLinecap="round" />
        </g>
      )
    case 'puzzles':
      return (
        <g transform={`translate(${cx},${cy})`}>
          <rect x={-r * 0.65} y={-r * 0.84} width={r * 1.3} height={r * 1.68} rx={r * 0.065} fill="none" stroke={COLORS.primary} strokeWidth={r * 0.07} />
          <circle cx={0} cy={0} r={r * 0.26} fill="none" stroke={COLORS.primary} strokeWidth={r * 0.07} />
          <circle cx={r * 0.65} cy={-r * 0.19} r={r * 0.13} fill={COLORS.primary} />
          <circle cx={r * 0.39} cy={0} r={r * 0.07} fill="#FFFFFF" />
          <path d={`M${-r * 0.26},${r * 0.32} L${r * 0.26},${r * 0.32}`} stroke={COLORS.primary} strokeWidth={r * 0.07} strokeLinecap="round" />
        </g>
      )
    case 'science':
      return (
        <g transform={`translate(${cx},${cy})`}>
          <ellipse cx={0} cy={-r * 0.19} rx={r * 0.52} ry={r * 0.39} fill="#FFFFFF" stroke={COLORS.success} strokeWidth={r * 0.065} />
          <line x1={0} y1={-r * 0.58} x2={0} y2={r * 0.91} stroke={COLORS.success} strokeWidth={r * 0.065} strokeLinecap="round" />
          <line x1={-r * 0.52} y1={-r * 0.19} x2={-r * 0.2} y2={r * 0.13} stroke={COLORS.success} strokeWidth={r * 0.065} strokeLinecap="round" />
          <line x1={r * 0.52} y1={-r * 0.19} x2={r * 0.2} y2={r * 0.13} stroke={COLORS.success} strokeWidth={r * 0.065} strokeLinecap="round" />
          <circle cx={0} cy={r * 0.91} r={r * 0.06} fill={COLORS.success} />
        </g>
      )
    case 'sports':
      return (
        <g transform={`translate(${cx},${cy})`}>
          <circle cx={0} cy={0} r={r * 0.91} fill="#FFFFFF" stroke={COLORS.secondary} strokeWidth={r * 0.065} />
          <circle cx={0} cy={0} r={r * 0.2} fill={COLORS.secondary} />
          <ellipse cx={0} cy={0} rx={r * 0.62} ry={r * 0.91} fill="none" stroke={COLORS.secondary} strokeWidth={r * 0.04} />
          <ellipse cx={0} cy={0} rx={r * 0.91} ry={r * 0.46} fill="none" stroke={COLORS.secondary} strokeWidth={r * 0.04} />
          <line x1={-r * 0.65} y1={-r * 0.65} x2={r * 0.65} y2={r * 0.65} stroke={COLORS.secondary} strokeWidth={r * 0.04} />
        </g>
      )
    default:
      return null
  }
}

export default function CategoryIcon({ categoryId, size = 512, className }: Props) {
  const cat = CATEGORIES.find((c) => c.id === categoryId)
  if (!cat) return null

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`تحدي الإجابات category — ${cat.label}`}
    >
      <SvgDefs />
      <rect x={0} y={0} width={512} height={512} rx={44} ry={44} fill="url(#gradBg)" stroke="url(#gradPinkPurple)" strokeWidth={6} filter="url(#glowPurple)" />
      <rect x={14} y={14} width={484} height={484} rx={32} ry={32} fill="none" stroke="#E6DEFF" strokeOpacity={0.18} strokeWidth={2} />
      <circle cx={430} cy={82} r={14} fill={cat.accent} filter="url(#glowAmber)" />
      <g filter="url(#glowPink)">
        <CategoryGlyph id={categoryId} cx={256} cy={256} r={155} />
      </g>
    </svg>
  )
}
