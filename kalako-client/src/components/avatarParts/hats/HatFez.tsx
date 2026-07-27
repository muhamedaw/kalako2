interface Props { size?: number; className?: string }

export default function HatFez({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <path d="M290,260 L290,140 Q360,110 430,140 L430,260Z" fill="#B0272F" stroke="#0A0A0A" strokeWidth={14} strokeLinejoin="round" />
      <circle cx={360} cy={112} r={10} fill="#FFD400" stroke="#0A0A0A" strokeWidth={5} />
      <path d="M360,122 L360,150" stroke="#FFD400" strokeWidth={6} strokeLinecap="round" />
    </svg>
  )
}
