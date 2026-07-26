import { motion, AnimatePresence } from 'framer-motion'
import { useToastStore } from '@/store/toastStore'

export default function Toast() {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none" aria-live="polite" role="status">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            role="alert"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`pointer-events-auto px-5 py-3 rounded-xl border-4 border-[#0A0A0A] shadow-[4px_4px_0_#0A0A0A] text-sm font-bold text-center max-w-xs ${
              t.type === 'success' ? 'bg-green-400 text-[#0A0A0A]' : t.type === 'info' ? 'bg-[#C6FF3D] text-[#0A0A0A]' : 'bg-red-400 text-[#0A0A0A]'
            }`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
