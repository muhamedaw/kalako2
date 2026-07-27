interface Props { size?: number; className?: string }

export default function Body11({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <circle cx={280} cy={420} r={100} fill="#9CAF88" stroke="#0A0A0A" strokeWidth={12} />
      <circle cx={440} cy={420} r={100} fill="#9CAF88" stroke="#0A0A0A" strokeWidth={12} />
      <circle cx={360} cy={370} r={165} fill="#9CAF88" stroke="#0A0A0A" strokeWidth={14} />
      <ellipse cx={290} cy={410} rx={18} ry={10} fill="#E85D75" opacity={0.5} />
      <ellipse cx={430} cy={410} rx={18} ry={10} fill="#E85D75" opacity={0.5} />
      <path d="M330 440 Q360 460 390 440" fill="none" stroke="#0A0A0A" strokeWidth={8} strokeLinecap="round" />
    </svg>
  )
}
