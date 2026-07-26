interface Props { size?: number; className?: string }

export default function Eyes8({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <g transform="translate(295, 340)">
        <circle cx={0} cy={0} r={24} fill="#FFFFFF" stroke="#0A0A0A" strokeWidth={8} />
        <path d="M0,-18 Q18,0 0,18 Q-18,0 0,-18" fill="none" stroke="#C6FF3D" strokeWidth={6} />
        <path d="M-12,-12 L12,12 M-12,12 L12,-12" stroke="#0A0A0A" strokeWidth={5} strokeLinecap="round" />
      </g>
      <g transform="translate(425, 340)">
        <circle cx={0} cy={0} r={24} fill="#FFFFFF" stroke="#0A0A0A" strokeWidth={8} />
        <path d="M0,-18 Q18,0 0,18 Q-18,0 0,-18" fill="none" stroke="#C6FF3D" strokeWidth={6} />
        <path d="M-12,-12 L12,12 M-12,12 L12,-12" stroke="#0A0A0A" strokeWidth={5} strokeLinecap="round" />
      </g>
    </svg>
  )
}
