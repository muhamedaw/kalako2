interface Props { size?: number; className?: string }

export default function EyesPremium06({ size = 720, className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width={size} height={size} className={className}>
      <g transform="translate(300, 345) scale(1.15)">
        <path d="M0,10 C-14,-8 -32,-2 -32,12 C-32,26 -14,34 0,44 C14,34 32,26 32,12 C32,-2 14,-8 0,10Z" fill="#FF3D7F" stroke="#0A0A0A" strokeWidth={7} strokeLinejoin="round" />
      </g>
      <g transform="translate(420, 345) scale(1.15)">
        <path d="M0,10 C-14,-8 -32,-2 -32,12 C-32,26 -14,34 0,44 C14,34 32,26 32,12 C32,-2 14,-8 0,10Z" fill="#FF3D7F" stroke="#0A0A0A" strokeWidth={7} strokeLinejoin="round" />
      </g>
    </svg>
  )
}
