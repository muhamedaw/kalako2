interface Props { size?: number; className?: string }

export default function Eyes9({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <g transform="translate(300, 335)">
        <circle r={26} fill="#FFFFFF" stroke="#0A0A0A" strokeWidth={10} />
        <circle cy={2} r={12} fill="#0A0A0A" />
        <path d="M-6,-30 L-2,-40 L2,-30Z" fill="#FFD400" />
        <path d="M18,-24 L26,-30 L24,-20Z" fill="#FFD400" />
      </g>
      <g transform="translate(420, 335)">
        <circle r={26} fill="#FFFFFF" stroke="#0A0A0A" strokeWidth={10} />
        <circle cy={2} r={12} fill="#0A0A0A" />
        <path d="M-6,-30 L-2,-40 L2,-30Z" fill="#FFD400" />
        <path d="M18,-24 L26,-30 L24,-20Z" fill="#FFD400" />
      </g>
    </svg>
  )
}
