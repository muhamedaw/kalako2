interface Props { size?: number; className?: string }

export default function Eyes10({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <g transform="translate(300, 340)">
        <path d="M0,-28 C16,-8 22,8 0,28 C-22,8 -16,-8 0,-28Z" fill="#7EC8E3" stroke="#0A0A0A" strokeWidth={8} strokeLinejoin="round" />
        <circle cy={6} r={5} fill="#FFFFFF" />
      </g>
      <g transform="translate(420, 340)">
        <path d="M0,-28 C16,-8 22,8 0,28 C-22,8 -16,-8 0,-28Z" fill="#7EC8E3" stroke="#0A0A0A" strokeWidth={8} strokeLinejoin="round" />
        <circle cy={6} r={5} fill="#FFFFFF" />
      </g>
    </svg>
  )
}
