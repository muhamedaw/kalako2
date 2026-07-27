interface Props { size?: number; className?: string }

export default function Body5({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <circle cx={360} cy={400} r={195} fill="#3DDC97" stroke="#0A0A0A" strokeWidth={14} />
      <ellipse cx={360} cy={480} rx={180} ry={110} fill="#3DDC97" stroke="#0A0A0A" strokeWidth={14} />
      <ellipse cx={280} cy={440} rx={22} ry={12} fill="#E85D75" opacity={0.5} />
      <ellipse cx={440} cy={440} rx={22} ry={12} fill="#E85D75" opacity={0.5} />
      <path d="M320 520 Q360 555 400 520" fill="none" stroke="#0A0A0A" strokeWidth={8} strokeLinecap="round" />
    </svg>
  )
}
