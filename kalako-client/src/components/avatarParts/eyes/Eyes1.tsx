interface Props { size?: number; className?: string }

export default function Eyes1({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <circle cx={300} cy={340} r={28} fill="#FFFFFF" stroke="#0A0A0A" strokeWidth={10} />
      <circle cx={300} cy={342} r={14} fill="#0A0A0A" />
      <circle cx={294} cy={334} r={5} fill="#FFFFFF" />
      <circle cx={420} cy={340} r={28} fill="#FFFFFF" stroke="#0A0A0A" strokeWidth={10} />
      <circle cx={420} cy={342} r={14} fill="#0A0A0A" />
      <circle cx={414} cy={334} r={5} fill="#FFFFFF" />
    </svg>
  )
}
