interface Props { size?: number; className?: string }

export default function Eyes5({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <g transform="translate(300, 345)">
        <path d="M0,8 C-10,-5 -28,-5 -28,8 C-28,18 -10,28 0,28 C10,28 28,18 28,8 C28,-5 10,-5 0,8Z" fill="#FF4081" stroke="#0A0A0A" strokeWidth={8} strokeLinejoin="round" />
        <circle cx={-2} cy={14} r={5} fill="#FFFFFF" />
      </g>
      <g transform="translate(420, 345)">
        <path d="M0,8 C-10,-5 -28,-5 -28,8 C-28,18 -10,28 0,28 C10,28 28,18 28,8 C28,-5 10,-5 0,8Z" fill="#FF4081" stroke="#0A0A0A" strokeWidth={8} strokeLinejoin="round" />
        <circle cx={-2} cy={14} r={5} fill="#FFFFFF" />
      </g>
    </svg>
  )
}
