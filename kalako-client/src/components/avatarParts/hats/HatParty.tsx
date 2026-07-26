interface Props { size?: number; className?: string }

export default function HatParty({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <path d="M360,60 L490,270 L230,270 Z" fill="#FF6B35" stroke="#0A0A0A" strokeWidth={12} strokeLinejoin="round" />
      <circle cx={360} cy={80} r={18} fill="#C6FF3D" stroke="#0A0A0A" strokeWidth={6} />
      <circle cx={340} cy={170} r={10} fill="#FFD400" stroke="#0A0A0A" strokeWidth={4} />
      <circle cx={400} cy={220} r={10} fill="#FF4081" stroke="#0A0A0A" strokeWidth={4} />
      <line x1={290} y1={270} x2={270} y2={280} stroke="#0A0A0A" strokeWidth={6} strokeLinecap="round" />
      <line x1={420} y1={270} x2={440} y2={280} stroke="#0A0A0A" strokeWidth={6} strokeLinecap="round" />
    </svg>
  )
}
