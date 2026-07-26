import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import { useGameStore } from '@/store/gameStore'
import { useTranslation } from '@/i18n/context'

export default function AboutCreditsScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const t = useTranslation()

  return (
    <div className="flex flex-col items-center min-h-dvh px-4 py-20">
      <div className="w-full max-w-md flex flex-col items-center gap-6">

        <button
          onClick={() => setScreen('welcome')}
          className="self-start flex items-center gap-1.5 text-sm text-white/60 hover:text-white/90 transition-colors cursor-pointer mb-2"
        >
          {t.lang === 'ar' || t.lang === 'he' ? '\u2190' : '\u2192'} {t.navHome}
        </button>

        <GlassCard strong className="w-full text-center">
          <div className="flex flex-col gap-4">
            <motion.h1
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
              className="text-3xl sm:text-4xl font-black"
              style={{
                fontFamily: 'var(--font-heading)',
                color: '#FF6B35',
                textShadow: '4px 4px 0 #0A0A0A',
              }}
            >
              {t.aboutCreatorName}
            </motion.h1>
            <p className="text-white/60 text-sm leading-relaxed">
              {t.aboutCreatorBio}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="w-full text-center">
          <div className="flex flex-col gap-3">
            <h2
              className="text-lg font-black"
              style={{
                fontFamily: 'var(--font-heading)',
                color: '#FF6B35',
                textShadow: '3px 3px 0 #0A0A0A',
              }}
            >
              {t.aboutCreditsTitle}
            </h2>
            <p className="text-white/50 text-sm leading-relaxed">
              {t.aboutCreditsBody}
            </p>
          </div>
        </GlassCard>

        <p className="text-white/20 text-xs mt-2">
          {t.aboutSignature}
        </p>

        {/* Legal links */}
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {([
            { kind: 'legal_privacy' as const, label: t.legalPrivacyTitle },
            { kind: 'legal_terms' as const, label: t.legalTermsTitle },
            { kind: 'legal_refund' as const, label: t.legalRefundTitle },
          ]).map(({ kind, label }) => (
            <button
              key={kind}
              onClick={() => setScreen(kind)}
              className="text-xs text-white/30 hover:text-white/60 transition-colors underline underline-offset-2 cursor-pointer"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
