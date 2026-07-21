import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-white/60" style={{ fontFamily: 'var(--font-body)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-white/5 border border-white/10
            text-white text-base
            placeholder:text-white/30
            focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20
            transition-all
            ${error ? 'border-red-500/50' : ''}
            ${className}
          `}
          style={{ fontFamily: 'var(--font-body)' }}
          {...props}
        />
        {error && (
          <span className="text-sm text-red-400">{error}</span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
