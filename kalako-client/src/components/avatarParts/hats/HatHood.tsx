interface Props { size?: number; className?: string }

export default function HatHood({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <path d="M210,320 Q195,140 360,120 Q525,140 510,320 Q470,270 360,270 Q250,270 210,320Z" fill="#2EC4B6" stroke="#0A0A0A" strokeWidth={14} strokeLinejoin="round" />
      <path d="M330,130 L340,105 L360,130 L380,105 L390,130" fill="none" stroke="#0A0A0A" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
