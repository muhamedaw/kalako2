interface Props { size?: number; className?: string }

export default function HatCap({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <path d="M220,250 Q220,120 360,100 Q500,120 500,250 Z" fill="#3A2143" stroke="#0A0A0A" strokeWidth={12} strokeLinejoin="round" />
      <rect x={220} y={230} width={280} height={24} rx={10} fill="#3A2143" stroke="#0A0A0A" strokeWidth={10} />
      <path d="M500,220 Q560,220 570,200 Q575,185 560,180" fill="none" stroke="#0A0A0A" strokeWidth={10} strokeLinecap="round" />
      <circle cx={560} cy={180} r={6} fill="#FF6B35" stroke="#0A0A0A" strokeWidth={4} />
    </svg>
  )
}
