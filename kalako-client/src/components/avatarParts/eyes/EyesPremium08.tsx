interface Props { size?: number; className?: string }

export default function EyesPremium08({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <g transform="translate(300, 342)">
        <path d="M-24,0 Q0,18 24,0" fill="none" stroke="#0A0A0A" strokeWidth={9} strokeLinecap="round" />
      </g>
      <g transform="translate(420, 340)">
        <circle r={24} fill="#FFFFFF" stroke="#0A0A0A" strokeWidth={9} />
        <circle cy={2} r={11} fill="#0A0A0A" />
        <circle cx={-4} cy={-3} r={4} fill="#FFFFFF" />
      </g>
    </svg>
  )
}
