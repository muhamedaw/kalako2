interface Props { size?: number; className?: string }

export default function Body3({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <rect x={165} y={200} width={390} height={400} rx={70} ry={70} fill="#C6FF3D" stroke="#0A0A0A" strokeWidth={14} />
      <ellipse cx={285} cy={440} rx={20} ry={12} fill="#E85D75" opacity={0.5} />
      <ellipse cx={435} cy={440} rx={20} ry={12} fill="#E85D75" opacity={0.5} />
      <rect x={310} y={505} width={100} height={16} rx={8} fill="#0A0A0A" />
    </svg>
  )
}
