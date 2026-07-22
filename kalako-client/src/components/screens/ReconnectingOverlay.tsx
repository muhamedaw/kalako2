import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { useTranslation } from '@/i18n/context'

export default function ReconnectingOverlay() {
  const isReconnecting = useGameStore((s) => s.isReconnecting)
  const t = useTranslation()

  if (!isReconnecting) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="alert"
      aria-live="assertive"
    >
      <motion.div
        className="glass-strong p-8 text-center max-w-xs"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="animate-pulse-glow mb-4">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        </div>
        <p className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
          {t.reconnecting}
        </p>
        <p className="text-white/40 text-sm mt-2">
          {t.reconnectingSub}
        </p>
      </motion.div>
    </motion.div>
  )
}
