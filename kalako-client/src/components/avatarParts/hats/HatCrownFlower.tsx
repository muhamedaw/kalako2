interface Props { size?: number; className?: string }

export default function HatCrownFlower({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <path d="M225,250 L245,160 L295,215 L360,145 L425,215 L475,160 L495,250Z" fill="#FFD400" stroke="#0A0A0A" strokeWidth={12} strokeLinejoin="round" />
      <rect x={225} y={248} width={270} height={26} rx={10} fill="#FFD400" stroke="#0A0A0A" strokeWidth={10} />
      <circle cx={245} cy={160} r={9} fill="#FF8FA3" stroke="#0A0A0A" strokeWidth={4} />
      <circle cx={360} cy={145} r={9} fill="#FF8FA3" stroke="#0A0A0A" strokeWidth={4} />
      <circle cx={475} cy={160} r={9} fill="#FF8FA3" stroke="#0A0A0A" strokeWidth={4} />
    </svg>
  )
}
