interface Props { size?: number; className?: string }

export default function Eyes11({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <g transform="translate(300, 340)">
        <rect x={-24} y={-24} width={48} height={48} fill="#FFFFFF" stroke="#0A0A0A" strokeWidth={10} />
        <rect x={-12} y={-12} width={24} height={24} fill="#0A0A0A" />
      </g>
      <g transform="translate(420, 340)">
        <rect x={-24} y={-24} width={48} height={48} fill="#FFFFFF" stroke="#0A0A0A" strokeWidth={10} />
        <rect x={-12} y={-12} width={24} height={24} fill="#0A0A0A" />
      </g>
    </svg>
  )
}
