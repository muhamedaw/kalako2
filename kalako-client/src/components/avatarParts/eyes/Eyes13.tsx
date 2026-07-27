interface Props { size?: number; className?: string }

export default function Eyes13({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <g transform="translate(300, 340)">
        <path d="M-24,0 Q0,20 24,0" fill="none" stroke="#0A0A0A" strokeWidth={9} strokeLinecap="round" />
        <circle cx={-30} cy={-14} r={5} fill="#7EC8E3" opacity={0.8} />
        <circle cx={-14} cy={-24} r={4} fill="#7EC8E3" opacity={0.6} />
      </g>
      <g transform="translate(420, 340)">
        <path d="M-24,0 Q0,20 24,0" fill="none" stroke="#0A0A0A" strokeWidth={9} strokeLinecap="round" />
        <circle cx={30} cy={-14} r={5} fill="#7EC8E3" opacity={0.8} />
        <circle cx={14} cy={-24} r={4} fill="#7EC8E3" opacity={0.6} />
      </g>
    </svg>
  )
}
