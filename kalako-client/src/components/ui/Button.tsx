import { useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const variants = {
  primary: 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25',
  secondary: 'bg-secondary text-white hover:bg-secondary/90 shadow-lg shadow-secondary/25',
  ghost: 'bg-white/5 text-white hover:bg-white/10 border border-white/10',
  danger: 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20',
}

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  onClick,
  ...props
}: ButtonProps) {
  const containerRef = useRef<HTMLButtonElement>(null)

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const el = containerRef.current
      if (el) {
        const rect = el.getBoundingClientRect()
        const ripple = document.createElement('span')
        ripple.className = 'ripple'
        const x = e.clientX - rect.left - 10
        const y = e.clientY - rect.top - 10
        ripple.style.left = x + 'px'
        ripple.style.top = y + 'px'
        el.appendChild(ripple)
        setTimeout(() => ripple.remove(), 650)
      }
      onClick?.(e)
    },
    [onClick],
  )

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.96 }}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      transition={{ duration: 0.15 }}
      ref={containerRef}
      className={`
        ripple-container font-bold transition-colors cursor-pointer select-none hover-glow
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-40 pointer-events-none' : ''}
        ${className}
      `}
      style={{ fontFamily: 'var(--font-heading)' }}
      disabled={disabled}
      onClick={handleClick}
      {...(props as any)}
    >
      {children}
    </motion.button>
  )
}
