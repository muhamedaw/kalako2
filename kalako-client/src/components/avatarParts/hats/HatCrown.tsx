interface Props { size?: number; className?: string }

export default function HatCrown({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <path d="M200,280 L250,100 L310,200 L360,80 L410,200 L470,100 L520,280 Z" fill="#FFD400" stroke="#0A0A0A" strokeWidth={12} strokeLinejoin="round" />
      <rect x={190} y={250} width={340} height={30} rx={8} fill="#FFD400" stroke="#0A0A0A" strokeWidth={10} />
      <circle cx={270} cy={140} r={10} fill="#FF4081" stroke="#0A0A0A" strokeWidth={4} />
      <circle cx={360} cy={110} r={10} fill="#C6FF3D" stroke="#0A0A0A" strokeWidth={4} />
      <circle cx={450} cy={140} r={10} fill="#3A2143" stroke="#0A0A0A" strokeWidth={4} />
    </svg>
  )
}
