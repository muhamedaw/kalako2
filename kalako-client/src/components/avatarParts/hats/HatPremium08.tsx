interface Props { size?: number; className?: string }

export default function HatPremium08({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <path d="M230,230 Q230,90 360,90 Q490,90 490,230" fill="none" stroke="#0A0A0A" strokeWidth={16} strokeLinecap="round" />
      <circle cx={225} cy={245} r={34} fill="#FF3D7F" stroke="#0A0A0A" strokeWidth={10} />
      <circle cx={495} cy={245} r={34} fill="#FF3D7F" stroke="#0A0A0A" strokeWidth={10} />
    </svg>
  )
}
