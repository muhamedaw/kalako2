import { motion, type HTMLMotionProps } from 'framer-motion'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
  strong?: boolean
}

export default function GlassCard({ children, className = '', strong = false, ...props }: GlassCardProps) {
  return (
    <motion.div
      className={strong ? `card-strong p-5 sm:p-6 ${className}` : `card p-4 sm:p-5 ${className}`}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
