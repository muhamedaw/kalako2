import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import LogoSquare from '@/components/brand/LogoSquare'
import { useGameStore } from '@/store/gameStore'
import { useTranslation } from '@/i18n/context'
import type { Lang } from '@/i18n/types'

interface Props {
  onContinueAsGuest: () => void
}

export default function AuthScreen({ onContinueAsGuest }: Props) {
  const setScreen = useGameStore((s) => s.setScreen)
  const t = useTranslation()
  const language = t.currentLang

  const LANGUAGES: { code: Lang; label: string }[] = [
    { code: 'ar', label: 'العربية' },
    { code: 'en', label: 'English' },
    { code: 'he', label: 'עברית' },
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 py-8 gap-6">
      {/* Heading — stays above the card */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-3xl font-black text-center relative z-[1]"
        style={{
          fontFamily: 'var(--font-heading)',
          color: '#FF6B35',
          textShadow: '0 0 24px rgba(255,107,53,0.5), 4px 4px 0 rgba(10,10,10,0.85)',
        }}
      >
        {t.authTitle}
      </motion.h1>

      {/* Card wrapper — icon peeks over the top edge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="relative w-full max-w-sm"
      >
        {/* Icon badge — peeking behind the card's top edge, never over content */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 -z-10 pointer-events-none">
          <div className="w-12 h-12 drop-shadow-[0_4px_24px_rgba(255,107,53,0.4)]">
            <LogoSquare />
          </div>
        </div>

        <GlassCard className="flex flex-col gap-4 pt-10">
          <Button
            variant="primary"
            size="md"
            fullWidth
            style={{ borderWidth: '3px', boxShadow: '4px 4px 0 #0A0A0A' }}
            onClick={onContinueAsGuest}
          >
            {t.authGuestButton}
          </Button>
          <p className="text-xs text-white/50 text-center -mt-1">
            {t.authGuestDescription}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] text-white/30 font-medium">{t.authOrDivider}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => setScreen('recover')}
          >
            {t.authLoginButton}
          </Button>
          <p className="text-xs text-white/50 text-center -mt-1">
            {t.authLoginDescription}
          </p>
        </GlassCard>
      </motion.div>

      {/* Wordmark — below the card */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="text-lg font-black text-center tracking-wide"
        style={{
          fontFamily: 'var(--font-heading)',
          color: '#FF6B35',
          textShadow: '0 0 16px rgba(255,107,53,0.35), 2px 2px 0 rgba(10,10,10,0.8)',
        }}
      >
        {t.logoSubtitle}
      </motion.p>

      {/* Language switcher */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-3"
      >
        {LANGUAGES.map((lng) => (
          <button
            key={lng.code}
            onClick={() => {
              t.setLang(lng.code)
              useGameStore.getState().setLanguage(lng.code)
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              language === lng.code
                ? 'bg-[#C6FF3D] text-[#0A0A0A]'
                : 'bg-white/10 text-white/50 hover:text-white'
            }`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {lng.label}
          </button>
        ))}
      </motion.div>
    </div>
  )
}
