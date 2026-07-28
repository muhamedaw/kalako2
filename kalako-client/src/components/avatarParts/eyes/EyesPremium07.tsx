interface Props { size?: number; className?: string }

export default function EyesPremium07({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <g transform="translate(300, 340)">
        <circle r={24} fill="#F5EDE4" stroke="#0A0A0A" strokeWidth={9} />
        <path d="M0,0 C6,-10 18,-10 18,0 C18,10 6,10 6,0 C6,-4 2,-4 2,0 C2,4 -6,4 -6,0 C-6,-10 -18,-10 -18,0 C-18,10 -6,10 0,0Z" fill="#C6FF3D" stroke="#0A0A0A" strokeWidth={3} />
      </g>
      <g transform="translate(420, 340)">
        <circle r={24} fill="#F5EDE4" stroke="#0A0A0A" strokeWidth={9} />
        <path d="M0,0 C6,-10 18,-10 18,0 C18,10 6,10 6,0 C6,-4 2,-4 2,0 C2,4 -6,4 -6,0 C-6,-10 -18,-10 -18,0 C-18,10 -6,10 0,0Z" fill="#C6FF3D" stroke="#0A0A0A" strokeWidth={3} />
      </g>
    </svg>
  )
}
