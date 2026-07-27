interface Props { size?: number; className?: string }

export default function HatHelmet({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <path d="M205,300 Q205,110 360,110 Q515,110 515,300" fill="#FFC94D" stroke="#0A0A0A" strokeWidth={14} strokeLinejoin="round" />
      <rect x={195} y={280} width={330} height={30} rx={14} fill="#FFC94D" stroke="#0A0A0A" strokeWidth={10} />
      <circle cx={360} cy={110} r={14} fill="#FF6B35" stroke="#0A0A0A" strokeWidth={6} />
    </svg>
  )
}
