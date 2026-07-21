import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import { useGameStore } from '@/store/gameStore'

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

export default function WelcomeScreen() {
  const setScreen = useGameStore((s) => s.setScreen)

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-4 py-8 gap-8">
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="text-center"
      >
        <motion.h1
          variants={fadeUp}
          className="text-5xl sm:text-6xl font-black mb-2 text-gradient"
          style={{ fontFamily: 'var(--font-heading)' }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          كلاكو
        </motion.h1>
        <motion.p variants={fadeUp} className="text-white/50 text-lg">
          لعبة أسئلة جماعية بالكذب والحقيقة
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <GlassCard className="flex flex-col gap-4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => setScreen('create')}
          >
            إنشاء غرفة جديدة
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => setScreen('join')}
          >
            الانضمام بكود
          </Button>
        </GlassCard>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-white/30 text-xs text-center"
      >
        أضف الكذابة وتسلّي مع أصحابك
      </motion.p>
    </div>
  )
}
