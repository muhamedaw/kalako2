interface Props { size?: number; className?: string }

export default function HatWizard({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <path d="M360,30 L540,260 Q450,230 360,260 Q270,230 180,260 Z" fill="#3A2143" stroke="#0A0A0A" strokeWidth={12} strokeLinejoin="round" />
      <ellipse cx={360} cy={255} rx={180} ry={20} fill="#3A2143" stroke="#0A0A0A" strokeWidth={10} />
      <path d="M280,140 Q300,120 340,130" fill="none" stroke="#FFD400" strokeWidth={6} strokeLinecap="round" />
      <circle cx={400} cy={110} r={10} fill="#C6FF3D" stroke="#0A0A0A" strokeWidth={4} />
      <path d="M360,30 L360,15" stroke="#0A0A0A" strokeWidth={6} strokeLinecap="round" />
      <circle cx={360} cy={10} r={6} fill="#C6FF3D" stroke="#0A0A0A" strokeWidth={3} />
    </svg>
  )
}
