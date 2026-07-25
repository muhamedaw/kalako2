import { motion } from 'framer-motion'
import { useTranslation } from '@/i18n/context'

const stagger = {
  animate: { transition: { staggerChildren: 0.15 } },
}
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
}

export default function AboutPage() {
  const t = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-4 py-20">
      <motion.div
        className="w-full max-w-md flex flex-col items-center text-center gap-8"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        {/* HELLO greeting — big mono teal style */}
        <motion.div variants={fadeUp} className="relative">
          <span
            className="block text-7xl sm:text-8xl font-black tracking-tight leading-none select-none"
            style={{
              fontFamily: 'var(--font-heading)',
              color: '#34E4EA',
              textShadow: '0 0 60px rgba(52,228,234,0.3), 0 0 120px rgba(52,228,234,0.1)',
              letterSpacing: '-2px',
            }}
          >
            {t.aboutGreeting}
          </span>
          <motion.div
            className="mx-auto mt-3 h-1 rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent, #34E4EA, transparent)' }}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '80%', opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
          />
        </motion.div>

        {/* Developer name */}
        <motion.div variants={fadeUp} className="flex flex-col gap-2">
          <h1
            className="text-3xl sm:text-4xl font-black text-white"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {t.aboutName}
          </h1>
          <p className="text-base text-white/40 font-medium tracking-wide" dir="ltr">
            {t.aboutNameEn}
          </p>
        </motion.div>

        {/* Role */}
        <motion.div variants={fadeUp}>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: 'rgba(52,228,234,0.08)',
              border: '1px solid rgba(52,228,234,0.15)',
            }}
          >
            <span className="text-sm" style={{ color: '#34E4EA' }}>
              🎮
            </span>
            <span
              className="text-sm font-bold"
              style={{ color: '#34E4EA', fontFamily: 'var(--font-heading)' }}
            >
              {t.aboutRole}
            </span>
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div
          variants={fadeUp}
          className="glass-strong p-6 w-full"
        >
          <p
            className="text-white/60 text-sm leading-relaxed"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {t.aboutBio}
          </p>
        </motion.div>

        {/* Signature */}
        <motion.p
          variants={fadeUp}
          className="text-white/25 text-xs"
        >
          {t.aboutSignature}
        </motion.p>
      </motion.div>
    </div>
  )
}
