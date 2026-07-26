interface Props { size?: number; className?: string }

export default function Eyes6({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <g transform="translate(300, 345)">
        <polygon points="0,-28 8,-10 28,-10 12,2 18,22 0,12 -18,22 -12,2 -28,-10 -8,-10" fill="#FFD400" stroke="#0A0A0A" strokeWidth={8} strokeLinejoin="round" />
        <circle cx={0} cy={2} r={6} fill="#0A0A0A" />
      </g>
      <g transform="translate(420, 345)">
        <polygon points="0,-28 8,-10 28,-10 12,2 18,22 0,12 -18,22 -12,2 -28,-10 -8,-10" fill="#FFD400" stroke="#0A0A0A" strokeWidth={8} strokeLinejoin="round" />
        <circle cx={0} cy={2} r={6} fill="#0A0A0A" />
      </g>
    </svg>
  )
}
