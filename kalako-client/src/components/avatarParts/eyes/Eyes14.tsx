interface Props { size?: number; className?: string }

export default function Eyes14({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <g transform="translate(300, 340)">
        <path d="M-26,0 Q0,-14 26,0 Q0,14 -26,0Z" fill="#C6FF3D" stroke="#0A0A0A" strokeWidth={8} strokeLinejoin="round" />
        <circle r={5} fill="#0A0A0A" />
      </g>
      <g transform="translate(420, 340)">
        <path d="M-26,0 Q0,-14 26,0 Q0,14 -26,0Z" fill="#C6FF3D" stroke="#0A0A0A" strokeWidth={8} strokeLinejoin="round" />
        <circle r={5} fill="#0A0A0A" />
      </g>
    </svg>
  )
}
