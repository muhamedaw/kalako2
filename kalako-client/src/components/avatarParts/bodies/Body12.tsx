interface Props { size?: number; className?: string }

export default function Body12({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <path d="M220,300 Q220,220 360,220 Q500,220 500,300 Q460,380 500,460 Q500,540 360,540 Q220,540 220,460 Q260,380 220,300Z" fill="#E8607D" stroke="#0A0A0A" strokeWidth={14} strokeLinejoin="round" />
      <ellipse cx={290} cy={370} rx={18} ry={10} fill="#0A0A0A" opacity={0.35} />
      <ellipse cx={430} cy={370} rx={18} ry={10} fill="#0A0A0A" opacity={0.35} />
      <path d="M325 430 Q360 460 395 430" fill="none" stroke="#0A0A0A" strokeWidth={8} strokeLinecap="round" />
    </svg>
  )
}
