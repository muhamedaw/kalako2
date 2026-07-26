import { motion } from 'framer-motion'
import { useEffect, useCallback } from 'react'
import { useFocusTrap } from '@/lib/useFocusTrap'

interface ArcadeModalProps {
  onClose?: () => void
  children: React.ReactNode
}

export default function ArcadeModal({ onClose, children }: ArcadeModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose?.()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // ArcadeModal only ever exists in the tree while open (parents mount/unmount it via
  // AnimatePresence), so the trap is active for its whole lifetime.
  const dialogRef = useFocusTrap<HTMLDivElement>(true)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        ref={dialogRef}
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 20 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="bg-[#FF6B35] border-4 border-[#0A0A0A] shadow-[6px_6px_0_#0A0A0A] w-full max-w-sm p-6 outline-none"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
