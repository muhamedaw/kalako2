interface Props { size?: number; className?: string }

export default function HatSombrero({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <ellipse cx={360} cy={240} rx={220} ry={35} fill="#FF6B35" stroke="#0A0A0A" strokeWidth={12} />
      <path d="M210,240 Q210,80 360,70 Q510,80 510,240" fill="#FF6B35" stroke="#0A0A0A" strokeWidth={12} strokeLinejoin="round" />
      <path d="M260,180 Q360,160 460,180" fill="none" stroke="#C6FF3D" strokeWidth={6} strokeLinecap="round" />
      <path d="M280,210 Q360,195 440,210" fill="none" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" />
    </svg>
  )
}
