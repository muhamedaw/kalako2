interface Props { size?: number; className?: string }

function Star({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45
    const ang = (Math.PI / 5) * i - Math.PI / 2
    pts.push(`${cx + rad * Math.cos(ang)},${cy + rad * Math.sin(ang)}`)
  }
  return <polygon points={pts.join(' ')} fill={fill} stroke="#0A0A0A" strokeWidth={6} strokeLinejoin="round" />
}

export default function HatPremium10({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <Star cx={360} cy={110} r={55} fill="#FFD400" />
      <Star cx={255} cy={170} r={26} fill="#C6FF3D" />
      <Star cx={465} cy={170} r={26} fill="#FF3D7F" />
    </svg>
  )
}
