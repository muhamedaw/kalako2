interface Props { size?: number; className?: string }

export default function Eyes16({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <g transform="translate(300, 340)">
        <path d="M0,-26 C18,-26 26,-10 22,6 C18,22 -18,22 -22,6 C-26,-10 -18,-26 0,-26Z" fill="#FF4081" opacity={0.85} stroke="#0A0A0A" strokeWidth={8} strokeLinejoin="round" />
        <ellipse cx={-6} cy={-8} rx={6} ry={4} fill="#FFFFFF" opacity={0.9} />
      </g>
      <g transform="translate(420, 340)">
        <path d="M0,-26 C18,-26 26,-10 22,6 C18,22 -18,22 -22,6 C-26,-10 -18,-26 0,-26Z" fill="#FF4081" opacity={0.85} stroke="#0A0A0A" strokeWidth={8} strokeLinejoin="round" />
        <ellipse cx={-6} cy={-8} rx={6} ry={4} fill="#FFFFFF" opacity={0.9} />
      </g>
    </svg>
  )
}
