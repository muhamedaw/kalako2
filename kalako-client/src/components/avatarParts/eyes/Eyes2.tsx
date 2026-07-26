interface Props { size?: number; className?: string }

export default function Eyes2({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <ellipse cx={295} cy={345} rx={32} ry={22} fill="#FFFFFF" stroke="#0A0A0A" strokeWidth={10} />
      <ellipse cx={300} cy={347} rx={14} ry={18} fill="#0A0A0A" />
      <circle cx={294} cy={336} r={4} fill="#FFFFFF" />
      <ellipse cx={425} cy={345} rx={32} ry={22} fill="#FFFFFF" stroke="#0A0A0A" strokeWidth={10} />
      <ellipse cx={430} cy={347} rx={14} ry={18} fill="#0A0A0A" />
      <circle cx={424} cy={336} r={4} fill="#FFFFFF" />
    </svg>
  )
}
