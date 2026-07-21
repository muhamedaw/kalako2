import { QRCodeSVG } from 'qrcode.react'
import { COLORS } from './theme'

interface Props {
  value: string
  size?: number
  className?: string
}

export default function ThemedQRCode({ value, size = 120, className }: Props) {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className ?? ''}`}
      style={{ width: size + 48, height: size + 48 }}
    >
      <svg
        viewBox="0 0 208 208"
        width={size + 48}
        height={size + 48}
        className="absolute inset-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="qrBorder" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={COLORS.primary} />
            <stop offset="100%" stopColor={COLORS.secondary} />
          </linearGradient>
          <filter id="qrGlow">
            <feGaussianBlur stdDeviation="3" result="b" in="SourceGraphic" />
            <feFlood floodColor={COLORS.primary} floodOpacity={0.6} />
            <feComposite in2="b" operator="in" result="g" />
            <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect x={4} y={4} width={200} height={200} rx={20} ry={20} fill={COLORS.bgEnd} stroke="url(#qrBorder)" strokeWidth={3} filter="url(#qrGlow)" />
        <rect x={12} y={12} width={184} height={184} rx={14} ry={14} fill="none" stroke="#FFFFFF" strokeOpacity={0.08} strokeWidth={1} />
        <circle cx={24} cy={24} r={3} fill={COLORS.success} />
        <circle cx={184} cy={184} r={3} fill={COLORS.warning} />
        <circle cx={184} cy={24} r={2.5} fill={COLORS.primary} />
        <circle cx={24} cy={184} r={2.5} fill={COLORS.secondary} />
      </svg>
      <div
        className="relative rounded-xl overflow-hidden"
        style={{ width: size, height: size }}
      >
        <QRCodeSVG
          value={value}
          size={size}
          bgColor="white"
          fgColor={COLORS.bgStart}
          level="M"
        />
      </div>
    </div>
  )
}
