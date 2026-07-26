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

  // Hero buttons: deliberately dialed back from the shared .arcade-btn default
  // (4px border / 6px shadow) to a lighter 3px/4px — reads confident next to the
  // refined typography above instead of competing with it for "chunkiest thing
  // on screen." Everywhere else keeps the default arcade-btn weight untouched.
  const heroButtonStyle = { borderWidth: '3px', boxShadow: '4px 4px 0 #0A0A0A' }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-4 py-8 gap-10 pt-20 sm:pt-24">
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="text-center"
      >
        <motion.h1
          // Never animate opacity from 0 on the LCP element — it delays Largest
          // Contentful Paint (measured ~2.2s render delay under throttled mobile in
          // Lighthouse before this fix). Scale-only keeps the "pop in" feel without
          // ever making the title invisible on first paint.
          initial={reducedMotion ? {} : { scale: 0.9 }}
          animate={reducedMotion ? {} : { scale: 1 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
          className="text-5xl sm:text-6xl font-black"
          style={{
            fontFamily: 'var(--font-heading)',
            color: '#FF6B35',
            WebkitTextStroke: t.lang === 'en' ? '1.5px #0A0A0A' : undefined,
            textShadow: '0 0 24px rgba(255,107,53,0.5), 4px 4px 0 rgba(10,10,10,0.85)',
          }}
        >
          {t.welcomeTitle}
        </motion.h1>
        {/* Visibly lighter than the title (weight 500 vs 800, no stroke/shadow) so it
            reads as a clear second tier instead of a second bold headline. */}
        <motion.p
          variants={fadeUp}
          className="text-white/70 text-base mt-3"
          style={{ fontWeight: 500 }}
        >
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
              size="md"
              fullWidth
              style={heroButtonStyle}
              onClick={() => onStartCreate(false)}
            >
              {t.playOnline}
            </Button>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              style={heroButtonStyle}
              onClick={() => onStartCreate(true)}
            >
              {t.playCreatePrivate}
            </Button>
          </div>

          <button
            onClick={() => setScreen('join')}
            className="text-white/50 text-sm hover:text-white/70 transition-colors cursor-pointer text-center"
          >
            {t.joinRoom}
          </button>
        </GlassCard>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-white/50 text-xs text-center"
      >
        {t.welcomeTagline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85 }}
        className="flex items-center justify-center gap-4 flex-wrap"
      >
        <button
          onClick={() => setScreen('legal_privacy')}
          className="text-[10px] text-white/50 hover:text-white/75 transition-colors cursor-pointer"
        >
          {t.navLegalPrivacy}
        </button>
        <button
          onClick={() => setScreen('legal_terms')}
          className="text-[10px] text-white/50 hover:text-white/75 transition-colors cursor-pointer"
        >
          {t.navLegalTerms}
        </button>
        <button
          onClick={() => setScreen('legal_refund')}
          className="text-[10px] text-white/50 hover:text-white/75 transition-colors cursor-pointer"
        >
          {t.navLegalRefund}
        </button>
      </motion.div>
    </div>
  )
}
