import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 cursor-pointer"
    >
      <div className="relative w-12 h-7 rounded-full bg-white/10 border border-white/10">
        <motion.div
          className="absolute top-0.5 w-6 h-6 rounded-full bg-primary"
          animate={{ left: checked ? '22px' : '2px' }}
          transition={{ duration: 0.2 }}
        />
      </div>
      <span className="text-sm text-white/70">{label}</span>
    </button>
  )
}

interface SelectProps {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  label?: string
}

export function Select({ value, onChange, options, label }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-white/60" style={{ fontFamily: 'var(--font-body)' }}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-base focus:outline-none focus:border-primary/50 cursor-pointer appearance-none"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#1B0E2E] text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

interface ChipGroupProps {
  items: { id: string; label: string; emoji?: string }[]
  selected: string[]
  onToggle: (id: string) => void
}

export function ChipGroup({ items, selected, onToggle }: ChipGroupProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="التصنيفات">
      {items.map((item) => {
        const isActive = selected.includes(item.id)
        return (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => onToggle(item.id)}
            role="checkbox"
            aria-checked={isActive}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer
              ${isActive
                ? 'bg-primary/20 border-primary/40 text-primary shadow-sm shadow-primary/10'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white/80'
              }
              border
            `}
          >
            {item.emoji && <span className="ml-1">{item.emoji}</span>}
            {item.label}
          </motion.button>
        )
      })}
    </div>
  )
}

interface BadgeProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning'
}

const badgeColors = {
  primary: 'bg-primary/15 text-primary border-primary/20',
  secondary: 'bg-secondary/15 text-secondary border-secondary/20',
  success: 'bg-success/15 text-success border-success/20',
  warning: 'bg-warning/15 text-warning border-warning/20',
}

export function Badge({ children, variant = 'primary' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${badgeColors[variant]}`}>
      {children}
    </span>
  )
}
