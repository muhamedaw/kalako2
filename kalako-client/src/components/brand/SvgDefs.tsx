import { COLORS } from './theme'

export default function SvgDefs() {
  return (
    <defs>
      <linearGradient id="gradBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={COLORS.bgStart} />
        <stop offset="100%" stopColor={COLORS.bgEnd} />
      </linearGradient>
      <linearGradient id="gradPinkPurple" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={COLORS.primary} />
        <stop offset="100%" stopColor={COLORS.secondary} />
      </linearGradient>
      <linearGradient id="gradPurplePink" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={COLORS.secondary} />
        <stop offset="100%" stopColor={COLORS.primary} />
      </linearGradient>
      <radialGradient id="gradCyanPop" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor={COLORS.success} stopOpacity={0.95} />
        <stop offset="100%" stopColor={COLORS.success} stopOpacity={0} />
      </radialGradient>
      <radialGradient id="gradAmberPop" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor={COLORS.warning} stopOpacity={0.95} />
        <stop offset="100%" stopColor={COLORS.warning} stopOpacity={0} />
      </radialGradient>
      <filter id="glowPink" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="2.5" result="b" in="SourceGraphic" />
        <feFlood floodColor={COLORS.primary} floodOpacity={0.9} />
        <feComposite in2="b" operator="in" result="glow" />
        <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="glowPurple" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="2.5" result="b" in="SourceGraphic" />
        <feFlood floodColor={COLORS.secondary} floodOpacity={0.85} />
        <feComposite in2="b" operator="in" result="glow" />
        <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="glowCyan" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="2" result="b" in="SourceGraphic" />
        <feFlood floodColor={COLORS.success} floodOpacity={0.9} />
        <feComposite in2="b" operator="in" result="glow" />
        <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="glowAmber" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="2.5" result="b" in="SourceGraphic" />
        <feFlood floodColor={COLORS.warning} floodOpacity={0.9} />
        <feComposite in2="b" operator="in" result="glow" />
        <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="softBlob" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="28" result="b" in="SourceGraphic" />
        <feFlood floodColor={COLORS.secondary} floodOpacity={0.55} />
        <feComposite in2="b" operator="in" result="glow" />
        <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <radialGradient id="gradHaloSplash" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor={COLORS.secondary} stopOpacity={0.55} />
        <stop offset="60%" stopColor={COLORS.bgStart} stopOpacity={0} />
      </radialGradient>
    </defs>
  )
}
