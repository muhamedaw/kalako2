interface Props { size?: number; className?: string }

export default function Body13({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <ellipse cx={360} cy={400} rx={220} ry={165} fill="#7EC8E3" stroke="#0A0A0A" strokeWidth={14} />
      <ellipse cx={270} cy={410} rx={20} ry={11} fill="#E85D75" opacity={0.5} />
      <ellipse cx={450} cy={410} rx={20} ry={11} fill="#E85D75" opacity={0.5} />
      <path d="M315 460 Q360 490 405 460" fill="none" stroke="#0A0A0A" strokeWidth={8} strokeLinecap="round" />
    </svg>
  )
}
