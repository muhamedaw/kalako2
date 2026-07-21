import { motion, type HTMLMotionProps } from 'framer-motion'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
  strong?: boolean
}

export default function GlassCard({ children, className = '', strong = false, ...props }: GlassCardProps) {
  return (
    <motion.div
      className={strong ? `glass-strong p-5 sm:p-6 ${className}` : `glass p-4 sm:p-5 ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
