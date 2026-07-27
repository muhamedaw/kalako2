interface Props { size?: number; className?: string }

export default function Body7({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <rect x={185} y={230} width={350} height={340} rx={130} fill="#FFB48A" stroke="#0A0A0A" strokeWidth={14} />
      <ellipse cx={285} cy={440} rx={20} ry={11} fill="#E85D75" opacity={0.5} />
      <ellipse cx={435} cy={440} rx={20} ry={11} fill="#E85D75" opacity={0.5} />
      <path d="M320 505 Q360 490 400 505" fill="none" stroke="#0A0A0A" strokeWidth={8} strokeLinecap="round" />
    </svg>
  )
}
