interface Props { size?: number; className?: string }

export default function HatHeadwrap({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <path d="M210,260 Q210,140 360,135 Q510,140 510,260 Q440,225 360,225 Q280,225 210,260Z" fill="#9CAF88" stroke="#0A0A0A" strokeWidth={14} strokeLinejoin="round" />
      <path d="M480,175 Q530,190 545,240 Q555,270 535,290" fill="none" stroke="#9CAF88" strokeWidth={20} strokeLinecap="round" />
      <path d="M480,175 Q530,190 545,240 Q555,270 535,290" fill="none" stroke="#0A0A0A" strokeWidth={4} strokeLinecap="round" opacity={0.4} />
    </svg>
  )
}
