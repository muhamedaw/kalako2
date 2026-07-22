import { motion } from 'framer-motion'
import { useTranslation } from '@/i18n/context'

const stagger = {
  animate: { transition: { staggerChildren: 0.12 } },
}
const stepIn = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
}

const STEP_ICONS = ['🏠', '📂', '✍️', '🗳️', '🏆']

export default function HowToPlayPage() {
  const t = useTranslation()

  const steps = [
    { title: t.step1Title, desc: t.step1Desc },
    { title: t.step2Title, desc: t.step2Desc },
    { title: t.step3Title, desc: t.step3Desc },
    { title: t.step4Title, desc: t.step4Desc },
    { title: t.step5Title, desc: t.step5Desc },
  ]

  return (
    <div className="flex flex-col items-center min-h-dvh px-4 py-20">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <h1
            className="text-2xl sm:text-3xl font-black text-gradient mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {t.howToPlayTitle}
          </h1>
          <p className="text-white/40 text-sm">{t.howToPlayIntro}</p>
        </div>

        {/* Steps */}
        <motion.div
          className="flex flex-col gap-4"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          {steps.map((step, i) => (
            <motion.div
              key={i}
              variants={stepIn}
              className="glass p-4 flex items-start gap-4"
            >
              {/* Step number + icon */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-lg"
                  style={{
                    background: 'rgba(52,228,234,0.1)',
                    border: '1.5px solid rgba(52,228,234,0.2)',
                  }}
                >
                  {STEP_ICONS[i]}
                </div>
                <span
                  className="text-[10px] font-bold"
                  style={{ color: '#34E4EA', fontFamily: 'var(--font-heading)' }}
                >
                  {i + 1}
                </span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 pt-1">
                <h3
                  className="text-base font-bold text-white mb-1"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-white/50 text-sm leading-relaxed"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
