interface Props { size?: number; className?: string }

export default function EyesPremium05({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <g transform="translate(300, 340)">
        <circle r={22} fill="#FFFFFF" stroke="#0A0A0A" strokeWidth={9} />
        <path d="M0,-14 L4,-4 L15,-4 L6,3 L9,14 L0,7 L-9,14 L-6,3 L-15,-4 L-4,-4Z" fill="#FF3D7F" stroke="#0A0A0A" strokeWidth={3} strokeLinejoin="round" />
      </g>
      <g transform="translate(420, 340)">
        <circle r={22} fill="#FFFFFF" stroke="#0A0A0A" strokeWidth={9} />
        <path d="M0,-14 L4,-4 L15,-4 L6,3 L9,14 L0,7 L-9,14 L-6,3 L-15,-4 L-4,-4Z" fill="#FF3D7F" stroke="#0A0A0A" strokeWidth={3} strokeLinejoin="round" />
      </g>
    </svg>
  )
}
