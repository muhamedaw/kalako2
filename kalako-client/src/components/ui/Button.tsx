import { useEffect, useState } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const variants = {
  primary: 'arcade-btn',
  secondary: 'arcade-btn',
  ghost: '',
  danger: '',
}

const sizes = {
  sm: 'px-4 py-2 text-sm min-h-[40px]',
  md: 'px-6 py-3 text-base min-h-[50px]',
  lg: 'px-8 py-4 text-lg min-h-[60px]',
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const reducedMotion = useReducedMotion()

  return (
    <button
      className={`
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-40 pointer-events-none' : ''}
        ${variant === 'ghost' ? 'bg-white/5 text-white border border-white/10 rounded-xl' : ''}
        ${variant === 'danger' ? 'bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl' : ''}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {variant === 'primary' || variant === 'secondary' ? (
        <div className="marquee-wrap">
          <div className="marquee-inner" style={reducedMotion ? { animation: 'none', justifyContent: 'center' } : {}}>
            <span>{children}</span>
            <span aria-hidden="true">{children}</span>
          </div>
        </div>
      ) : (
        <span>{children}</span>
      )}
    </button>
  )
}
