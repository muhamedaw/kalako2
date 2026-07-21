import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import { useGameStore } from '@/store/gameStore'

export default function WelcomeScreen() {
  const setScreen = useGameStore((s) => s.setScreen)

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-4 py-8 gap-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <h1 className="text-5xl sm:text-6xl font-black mb-2 text-gradient" style={{ fontFamily: 'var(--font-heading)' }}>
          كلاكو
        </h1>
        <p className="text-white/50 text-lg">لعبة أسئلة جماعية بالكذب والحقيقة</p>
      </motion.div>

      <GlassCard className="w-full max-w-sm flex flex-col gap-4">
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

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-white/30 text-xs text-center"
      >
        أضف الكذابة وتسلّي مع أصحابك
      </motion.p>
    </div>
  )
}
