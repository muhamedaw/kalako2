import { motion } from 'framer-motion'
import { CheckSquare } from 'lucide-react'
import { useTranslation } from '@/i18n/context'

export default function GlobalVotingScreen() {
  const t = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-4 gap-4 pb-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
      >
        <CheckSquare size={40} className="text-primary" strokeWidth={1.5} />
      </motion.div>
      <h2 className="text-2xl font-black text-gradient" style={{ fontFamily: 'var(--font-heading)' }}>
        {t.comingSoonTitle}
      </h2>
      <p className="text-white/50 text-sm text-center max-w-xs">{t.comingSoonSubtitle}</p>
    </div>
  )
}
