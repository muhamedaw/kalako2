interface Props { size?: number; className?: string }

export default function Body9({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <circle cx={360} cy={370} r={175} fill="#FF8FA3" stroke="#0A0A0A" strokeWidth={14} />
      <ellipse cx={360} cy={545} rx={210} ry={95} fill="#FF8FA3" stroke="#0A0A0A" strokeWidth={14} />
      <ellipse cx={280} cy={410} rx={22} ry={12} fill="#E85D75" opacity={0.6} />
      <ellipse cx={440} cy={410} rx={22} ry={12} fill="#E85D75" opacity={0.6} />
      <ellipse cx={360} cy={470} rx={18} ry={14} fill="#0A0A0A" />
    </svg>
  )
}
