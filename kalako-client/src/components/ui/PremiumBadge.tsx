import { Star } from 'lucide-react'
import { useTranslation } from '@/i18n/context'

interface PremiumBadgeProps {
  size?: number
  className?: string
}

export default function PremiumBadge({ size = 14, className = '' }: PremiumBadgeProps) {
  const t = useTranslation()
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      aria-label={t.premiumBadgeAria}
    >
      <Star size={size} fill="#C6FF3D" color="#C6FF3D" strokeWidth={1.5} />
    </span>
  )
}
