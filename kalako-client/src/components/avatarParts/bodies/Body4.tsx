interface Props { size?: number; className?: string }

export default function Body4({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <ellipse cx={360} cy={370} rx={150} ry={175} fill="#F5EDE4" stroke="#0A0A0A" strokeWidth={14} />
      <ellipse cx={360} cy={490} rx={190} ry={120} fill="#F5EDE4" stroke="#0A0A0A" strokeWidth={14} />
      <ellipse cx={290} cy={430} rx={18} ry={10} fill="#E85D75" opacity={0.4} />
      <ellipse cx={430} cy={430} rx={18} ry={10} fill="#E85D75" opacity={0.4} />
      <path d="M325 510 Q360 540 395 510" fill="none" stroke="#0A0A0A" strokeWidth={8} strokeLinecap="round" />
    </svg>
  )
}
