interface Props { size?: number; className?: string }

export default function HatViking({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <path d="M220,250 Q220,120 360,100 Q500,120 500,250 Z" fill="#FF6B35" stroke="#0A0A0A" strokeWidth={12} strokeLinejoin="round" />
      <rect x={210} y={220} width={300} height={30} rx={10} fill="#FF6B35" stroke="#0A0A0A" strokeWidth={10} />
      <path d="M230,140 L150,80 Q140,75 135,90 L170,160" fill="#C6FF3D" stroke="#0A0A0A" strokeWidth={8} strokeLinejoin="round" />
      <path d="M490,140 L570,80 Q580,75 585,90 L550,160" fill="#C6FF3D" stroke="#0A0A0A" strokeWidth={8} strokeLinejoin="round" />
      <circle cx={360} cy={130} r={10} fill="#FFD400" stroke="#0A0A0A" strokeWidth={4} />
    </svg>
  )
}
