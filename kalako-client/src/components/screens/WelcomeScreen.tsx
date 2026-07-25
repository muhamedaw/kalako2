import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import { useGameStore } from '@/store/gameStore'
import { useTranslation } from '@/i18n/context'

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
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

interface Props {
  onStartCreate: (isPrivate: boolean) => void
}

export default function WelcomeScreen({ onStartCreate }: Props) {
  const setScreen = useGameStore((s) => s.setScreen)
  const t = useTranslation()
  const reducedMotion = useReducedMotion()

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-4 py-8 gap-8 pt-16">
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="text-center"
      >
        <motion.h1
          initial={reducedMotion ? { opacity: 0 } : { scale: 0.9, opacity: 0 }}
          animate={reducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
          className="text-5xl sm:text-6xl font-black"
          style={{
            fontFamily: 'var(--font-heading)',
            color: '#FFD400',
            WebkitTextStroke: t.lang === 'en' ? '1.5px #0A0A0A' : undefined,
            textShadow: '0 0 24px rgba(255,212,0,0.5), 4px 4px 0 rgba(10,10,10,0.85)',
          }}
        >
          {t.welcomeTitle}
        </motion.h1>
        <motion.p variants={fadeUp} className="text-white/70 text-lg" style={{ fontWeight: 700 }}>
          {t.welcomeSubtitle}
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="w-full max-w-sm md:max-w-2xl"
      >
        <GlassCard className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              marquee
              onClick={() => onStartCreate(false)}
            >
              {t.playOnline}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              marquee
              onClick={() => onStartCreate(true)}
            >
              {t.playCreatePrivate}
            </Button>
          </div>

          <button
            onClick={() => setScreen('join')}
            className="text-white/40 text-sm hover:text-white/70 transition-colors cursor-pointer text-center"
          >
            {t.joinRoom}
          </button>
        </GlassCard>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-white/40 text-xs text-center"
      >
        {t.welcomeTagline}
      </motion.p>
    </div>
  )
}
