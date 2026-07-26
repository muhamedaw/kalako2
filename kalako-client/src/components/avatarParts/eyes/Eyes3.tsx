interface Props { size?: number; className?: string }

export default function Eyes3({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <g transform="translate(290, 340)">
        <polygon points="0,-30 10,-10 30,-10 15,5 20,25 0,15 -20,25 -15,5 -30,-10 -10,-10" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth={8} strokeLinejoin="round" />
        <circle cx={0} cy={-3} r={8} fill="#0A0A0A" />
      </g>
      <g transform="translate(425, 340)">
        <polygon points="0,-30 10,-10 30,-10 15,5 20,25 0,15 -20,25 -15,5 -30,-10 -10,-10" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth={8} strokeLinejoin="round" />
        <circle cx={0} cy={-3} r={8} fill="#0A0A0A" />
      </g>
    </svg>
  )
}
