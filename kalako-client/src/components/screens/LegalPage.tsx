import { motion } from 'framer-motion'
import { useTranslation } from '@/i18n/context'
import { useGameStore } from '@/store/gameStore'

type LegalKind = 'privacy' | 'terms' | 'refund'

interface Props {
  kind: LegalKind
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
}

export default function LegalPage({ kind }: Props) {
  const t = useTranslation()
  const setScreen = useGameStore((s) => s.setScreen)

  const title =
    kind === 'privacy'
      ? t.legalPrivacyTitle
      : kind === 'terms'
        ? t.legalTermsTitle
        : t.legalRefundTitle

  const body =
    kind === 'privacy'
      ? t.legalPrivacyBody
      : kind === 'terms'
        ? t.legalTermsBody
        : t.legalRefundBody

  const paragraphs = body.split('\n\n').filter(Boolean)

  return (
    <div className="flex flex-col min-h-dvh px-4 py-20">
      <motion.div
        className="w-full max-w-lg mx-auto flex flex-col gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Back button */}
        <motion.button
          {...fadeUp}
          onClick={() => setScreen('welcome')}
          className="self-start text-sm font-medium opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--color-primary)' }}
        >
          {t.back}
        </motion.button>

        {/* Title */}
        <motion.h1
          {...fadeUp}
          className="text-2xl sm:text-3xl font-black text-white text-center"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {title}
        </motion.h1>

        {/* Body */}
        <motion.div
          {...fadeUp}
          className="flex flex-col gap-4 text-sm leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.75)' }}
        >
          {paragraphs.map((p, i) => {
            const isHeading =
              !p.startsWith('•') &&
              !p.startsWith('DISCLAIMER') &&
              !p.startsWith('Last') &&
              !p.startsWith('آخر') &&
              !p.startsWith('עודכן') &&
              p.length < 60 &&
              i > 0

            if (isHeading) {
              return (
                <h2
                  key={i}
                  className="text-base font-bold text-white mt-2"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {p}
                </h2>
              )
            }

            return (
              <p key={i} className={p.startsWith('DISCLAIMER') || p.startsWith('تنبيه') || p.startsWith('הצהרה') ? 'text-xs italic opacity-50 border-t border-white/10 pt-3 mt-1' : ''}>
                {p.split('\n').map((line, j) =>
                  line.startsWith('•') ? (
                    <span key={j} className="block pl-4 before:content-['']">
                      {line}
                    </span>
                  ) : (
                    <span key={j} className="block">
                      {line}
                    </span>
                  ),
                )}
              </p>
            )
          })}
        </motion.div>

        {/* Bottom spacer */}
        <div className="h-12" />
      </motion.div>
    </div>
  )
}
