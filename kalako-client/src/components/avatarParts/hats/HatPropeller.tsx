interface Props { size?: number; className?: string }

export default function HatPropeller({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <ellipse cx={360} cy={240} rx={190} ry={28} fill="#FF6B35" stroke="#0A0A0A" strokeWidth={12} />
      <circle cx={360} cy={160} r={45} fill="#FF6B35" stroke="#0A0A0A" strokeWidth={10} />
      <circle cx={360} cy={160} r={18} fill="#FFFFFF" stroke="#0A0A0A" strokeWidth={6} />
      <path d="M360,100 L360,60" stroke="#0A0A0A" strokeWidth={6} strokeLinecap="round" />
      <ellipse cx={360} cy={50} rx={40} ry={8} fill="#C6FF3D" stroke="#0A0A0A" strokeWidth={5} />
    </svg>
  )
}
