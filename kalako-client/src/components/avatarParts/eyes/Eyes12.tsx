interface Props { size?: number; className?: string }

export default function Eyes12({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <g transform="translate(300, 340)">
        <path d="M-24,0 A24,24 0 1,0 24,0 A18,18 0 1,1 -24,0Z" fill="#F5EDE4" stroke="#0A0A0A" strokeWidth={8} strokeLinejoin="round" />
      </g>
      <g transform="translate(420, 340)">
        <path d="M-24,0 A24,24 0 1,0 24,0 A18,18 0 1,1 -24,0Z" fill="#F5EDE4" stroke="#0A0A0A" strokeWidth={8} strokeLinejoin="round" />
      </g>
    </svg>
  )
}
