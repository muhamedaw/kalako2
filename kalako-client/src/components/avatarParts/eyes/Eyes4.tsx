interface Props { size?: number; className?: string }

export default function Eyes4({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <g transform="translate(295, 350)">
        <path d="M-20,-8 Q-8,-20 8,-8" fill="none" stroke="#0A0A0A" strokeWidth={10} strokeLinecap="round" />
        <circle cx={-5} cy={0} r={10} fill="#0A0A0A" />
      </g>
      <g transform="translate(420, 350)">
        <path d="M-20,-8 Q-8,-20 8,-8" fill="none" stroke="#0A0A0A" strokeWidth={10} strokeLinecap="round" />
        <circle cx={-5} cy={0} r={10} fill="#0A0A0A" />
      </g>
    </svg>
  )
}
