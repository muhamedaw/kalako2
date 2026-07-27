interface Props { size?: number; className?: string }

export default function Eyes18({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <g transform="translate(300, 340)">
        <circle r={26} fill="#FFFFFF" stroke="#0A0A0A" strokeWidth={10} />
        <path d="M6,-16 L-6,0 L2,0 L-6,16 L10,-4 L2,-4Z" fill="#FFD400" stroke="#0A0A0A" strokeWidth={3} strokeLinejoin="round" />
      </g>
      <g transform="translate(420, 340)">
        <circle r={26} fill="#FFFFFF" stroke="#0A0A0A" strokeWidth={10} />
        <path d="M6,-16 L-6,0 L2,0 L-6,16 L10,-4 L2,-4Z" fill="#FFD400" stroke="#0A0A0A" strokeWidth={3} strokeLinejoin="round" />
      </g>
    </svg>
  )
}
