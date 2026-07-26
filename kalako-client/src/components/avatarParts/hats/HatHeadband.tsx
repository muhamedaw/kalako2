interface Props { size?: number; className?: string }

export default function HatHeadband({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <path d="M215,240 Q360,180 505,240" fill="none" stroke="#FF6B35" strokeWidth={16} strokeLinecap="round" />
      <circle cx={340} cy={220} r={10} fill="#C6FF3D" stroke="#0A0A0A" strokeWidth={4} />
      <circle cx={380} cy={225} r={10} fill="#C6FF3D" stroke="#0A0A0A" strokeWidth={4} />
      <path d="M215,240 Q195,260 200,280" fill="none" stroke="#FF6B35" strokeWidth={12} strokeLinecap="round" />
    </svg>
  )
}
