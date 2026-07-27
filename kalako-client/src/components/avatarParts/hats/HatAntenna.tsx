interface Props { size?: number; className?: string }

export default function HatAntenna({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <path d="M310,220 Q305,140 300,90" fill="none" stroke="#0A0A0A" strokeWidth={8} strokeLinecap="round" />
      <path d="M410,220 Q415,140 420,90" fill="none" stroke="#0A0A0A" strokeWidth={8} strokeLinecap="round" />
      <circle cx={300} cy={82} r={18} fill="#C6FF3D" stroke="#0A0A0A" strokeWidth={8} />
      <circle cx={420} cy={82} r={18} fill="#FF4081" stroke="#0A0A0A" strokeWidth={8} />
    </svg>
  )
}
