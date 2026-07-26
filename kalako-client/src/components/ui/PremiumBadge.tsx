import { Star } from 'lucide-react'

interface PremiumBadgeProps {
  size?: number
  className?: string
}

export default function PremiumBadge({ size = 14, className = '' }: PremiumBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      aria-label="Premium member"
    >
      <Star size={size} fill="#C6FF3D" color="#C6FF3D" strokeWidth={1.5} />
    </span>
  )
}
