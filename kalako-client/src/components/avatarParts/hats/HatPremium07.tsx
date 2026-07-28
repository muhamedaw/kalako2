interface Props { size?: number; className?: string }

export default function HatPremium07({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <ellipse cx={360} cy={100} rx={95} ry={28} fill="none" stroke="#FFD400" strokeWidth={16} />
      <ellipse cx={360} cy={100} rx={95} ry={28} fill="none" stroke="#0A0A0A" strokeWidth={4} />
    </svg>
  )
}
