interface Props { size?: number; className?: string }

export default function Eyes15({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <g transform="translate(300, 340)">
        <circle r={26} fill="#3A2143" stroke="#0A0A0A" strokeWidth={10} />
        <path d="M0,0 Q10,-10 0,-18 Q-10,-10 -4,-4 Q0,-2 2,-6" fill="none" stroke="#FF4081" strokeWidth={4} strokeLinecap="round" />
      </g>
      <g transform="translate(420, 340)">
        <circle r={26} fill="#3A2143" stroke="#0A0A0A" strokeWidth={10} />
        <path d="M0,0 Q10,-10 0,-18 Q-10,-10 -4,-4 Q0,-2 2,-6" fill="none" stroke="#FF4081" strokeWidth={4} strokeLinecap="round" />
      </g>
    </svg>
  )
}
