interface Props { size?: number; className?: string }

export default function HatBeret({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <ellipse cx={355} cy={195} rx={135} ry={75} fill="#E8607D" stroke="#0A0A0A" strokeWidth={14} />
      <ellipse cx={355} cy={235} rx={150} ry={30} fill="#E8607D" stroke="#0A0A0A" strokeWidth={12} />
      <circle cx={420} cy={135} r={10} fill="#0A0A0A" />
    </svg>
  )
}
