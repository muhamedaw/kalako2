interface Props { size?: number; className?: string }

export default function HatCowboy({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <ellipse cx={360} cy={250} rx={205} ry={38} fill="#C9963C" stroke="#0A0A0A" strokeWidth={14} />
      <path d="M255,250 Q255,130 360,130 Q465,130 465,250" fill="#C9963C" stroke="#0A0A0A" strokeWidth={14} strokeLinejoin="round" />
      <path d="M280,220 Q360,205 440,220" fill="none" stroke="#0A0A0A" strokeWidth={8} strokeLinecap="round" />
    </svg>
  )
}
