interface Props { size?: number; className?: string }

export default function Eyes7({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <g transform="translate(295, 340)">
        <ellipse cx={0} cy={0} rx={22} ry={18} fill="#FF6B35" stroke="#0A0A0A" strokeWidth={8} />
        <circle cx={0} cy={0} r={8} fill="#FFFFFF" />
        <path d="M-18,-14 L22,14" stroke="#0A0A0A" strokeWidth={6} strokeLinecap="round" />
        <path d="M18,-14 L-22,14" stroke="#0A0A0A" strokeWidth={6} strokeLinecap="round" />
      </g>
      <g transform="translate(425, 340)">
        <ellipse cx={0} cy={0} rx={22} ry={18} fill="#FF6B35" stroke="#0A0A0A" strokeWidth={8} />
        <circle cx={0} cy={0} r={8} fill="#FFFFFF" />
        <path d="M-18,-14 L22,14" stroke="#0A0A0A" strokeWidth={6} strokeLinecap="round" />
        <path d="M18,-14 L-22,14" stroke="#0A0A0A" strokeWidth={6} strokeLinecap="round" />
      </g>
    </svg>
  )
}
