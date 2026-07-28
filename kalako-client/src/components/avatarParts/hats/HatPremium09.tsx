interface Props { size?: number; className?: string }

export default function HatPremium09({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <path d="M255,240 Q225,60 275,50 Q320,60 300,240Z" fill="#F5EDE4" stroke="#0A0A0A" strokeWidth={10} strokeLinejoin="round" />
      <path d="M420,240 Q400,60 445,50 Q495,60 465,240Z" fill="#F5EDE4" stroke="#0A0A0A" strokeWidth={10} strokeLinejoin="round" />
      <path d="M268,220 Q255,110 275,100 Q295,110 288,220Z" fill="#FF3D7F" />
      <path d="M433,220 Q420,110 445,100 Q465,110 452,220Z" fill="#FF3D7F" />
    </svg>
  )
}
