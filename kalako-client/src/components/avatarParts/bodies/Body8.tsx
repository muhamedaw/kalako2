interface Props { size?: number; className?: string }

export default function Body8({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <ellipse cx={360} cy={330} rx={135} ry={155} fill="#2EC4B6" stroke="#0A0A0A" strokeWidth={14} />
      <ellipse cx={360} cy={510} rx={175} ry={125} fill="#2EC4B6" stroke="#0A0A0A" strokeWidth={14} />
      <ellipse cx={290} cy={330} rx={18} ry={10} fill="#0A0A0A" opacity={0.3} />
      <ellipse cx={430} cy={330} rx={18} ry={10} fill="#0A0A0A" opacity={0.3} />
      <path d="M330 400 Q360 420 390 400" fill="none" stroke="#0A0A0A" strokeWidth={8} strokeLinecap="round" />
    </svg>
  )
}
