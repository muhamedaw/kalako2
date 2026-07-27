interface Props { size?: number; className?: string }

export default function Eyes17({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <g transform="translate(300, 340)">
        <ellipse rx={26} ry={18} fill="#F5EDE4" opacity={0.9} stroke="#0A0A0A" strokeWidth={8} />
        <circle cx={-6} cy={-2} r={6} fill="#7EC8E3" />
      </g>
      <g transform="translate(420, 340)">
        <ellipse rx={26} ry={18} fill="#F5EDE4" opacity={0.9} stroke="#0A0A0A" strokeWidth={8} />
        <circle cx={6} cy={-2} r={6} fill="#7EC8E3" />
      </g>
    </svg>
  )
}
