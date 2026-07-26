interface Props { size?: number; className?: string }

export default function HatTophat({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <rect x={240} y={60} width={240} height={190} rx={12} fill="#3A2143" stroke="#0A0A0A" strokeWidth={12} />
      <rect x={210} y={230} width={300} height={28} rx={8} fill="#3A2143" stroke="#0A0A0A" strokeWidth={12} />
      <rect x={240} y={80} width={240} height={6} fill="#FF6B35" />
    </svg>
  )
}
