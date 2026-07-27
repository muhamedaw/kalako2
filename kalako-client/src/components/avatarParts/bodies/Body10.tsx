interface Props { size?: number; className?: string }

export default function Body10({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <rect x={200} y={210} width={320} height={320} rx={80} fill="#FFC94D" stroke="#0A0A0A" strokeWidth={14} transform="rotate(45 360 370)" />
      <ellipse cx={290} cy={440} rx={18} ry={10} fill="#E85D75" opacity={0.5} />
      <ellipse cx={430} cy={440} rx={18} ry={10} fill="#E85D75" opacity={0.5} />
      <path d="M320 500 Q360 530 400 500" fill="none" stroke="#0A0A0A" strokeWidth={8} strokeLinecap="round" />
    </svg>
  )
}
