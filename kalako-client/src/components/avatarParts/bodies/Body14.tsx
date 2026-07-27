interface Props { size?: number; className?: string }

export default function Body14({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <rect x={230} y={180} width={260} height={400} rx={130} fill="#8B5E3C" stroke="#0A0A0A" strokeWidth={14} />
      <ellipse cx={295} cy={430} rx={18} ry={10} fill="#0A0A0A" opacity={0.3} />
      <ellipse cx={425} cy={430} rx={18} ry={10} fill="#0A0A0A" opacity={0.3} />
      <path d="M325 490 Q360 515 395 490" fill="none" stroke="#0A0A0A" strokeWidth={8} strokeLinecap="round" />
    </svg>
  )
}
