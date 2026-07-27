interface Props { size?: number; className?: string }

export default function Body6({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <ellipse cx={360} cy={400} rx={155} ry={220} fill="#B39DDB" stroke="#0A0A0A" strokeWidth={14} />
      <ellipse cx={290} cy={440} rx={18} ry={10} fill="#E85D75" opacity={0.5} />
      <ellipse cx={430} cy={440} rx={18} ry={10} fill="#E85D75" opacity={0.5} />
      <circle cx={360} cy={520} r={16} fill="none" stroke="#0A0A0A" strokeWidth={8} />
    </svg>
  )
}
