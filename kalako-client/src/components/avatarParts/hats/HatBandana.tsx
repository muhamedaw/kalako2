interface Props { size?: number; className?: string }

export default function HatBandana({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <path d="M210,250 Q360,190 510,250 L510,275 Q360,225 210,275Z" fill="#FF4081" stroke="#0A0A0A" strokeWidth={12} strokeLinejoin="round" />
      <path d="M510,255 Q555,270 545,300 Q520,290 505,270Z" fill="#FF4081" stroke="#0A0A0A" strokeWidth={10} strokeLinejoin="round" />
      <circle cx={280} cy={230} r={6} fill="#FFFFFF" opacity={0.8} />
      <circle cx={360} cy={214} r={6} fill="#FFFFFF" opacity={0.8} />
      <circle cx={440} cy={230} r={6} fill="#FFFFFF" opacity={0.8} />
    </svg>
  )
}
