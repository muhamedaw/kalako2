interface Props { size?: number; className?: string }

export default function HatFlower({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <g transform="translate(360, 160)">
        <ellipse cx={0} cy={-22} rx={16} ry={22} fill="#FF8FA3" stroke="#0A0A0A" strokeWidth={6} />
        <ellipse cx={21} cy={-7} rx={16} ry={22} fill="#FF8FA3" stroke="#0A0A0A" strokeWidth={6} transform="rotate(72 21 -7)" />
        <ellipse cx={13} cy={18} rx={16} ry={22} fill="#FF8FA3" stroke="#0A0A0A" strokeWidth={6} transform="rotate(144 13 18)" />
        <ellipse cx={-13} cy={18} rx={16} ry={22} fill="#FF8FA3" stroke="#0A0A0A" strokeWidth={6} transform="rotate(216 -13 18)" />
        <ellipse cx={-21} cy={-7} rx={16} ry={22} fill="#FF8FA3" stroke="#0A0A0A" strokeWidth={6} transform="rotate(288 -21 -7)" />
        <circle r={14} fill="#FFD400" stroke="#0A0A0A" strokeWidth={6} />
      </g>
    </svg>
  )
}
