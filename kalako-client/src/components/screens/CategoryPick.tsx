import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { getCategoryLabel, getCategoryEmoji } from '@/types'
import { useTranslation } from '@/i18n/context'

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
}
const cardIn = {
  initial: { opacity: 0, scale: 0.85, y: 16 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
}

export default function CategoryPick() {
  const { room, playerId, categoryOptions, pickCategory } = useGameStore()
  const t = useTranslation()

  if (!room) return null

  const isHost = room.hostId === playerId

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-4 py-8 gap-6">
      <div className="w-full max-w-sm flex flex-col gap-5">
        <div className="text-center">
          <h2 className="text-2xl font-black text-gradient mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            {t.categoryPickTitle}
          </h2>
          <p className="text-white/40 text-sm">
            {isHost ? t.pickCategoryHost : t.pickCategoryWaiting}
            {room.isTiebreakerRound && <span className="text-warning block mt-1">{t.tiebreaker}</span>}
          </p>
        </div>

        <motion.div
          className="grid grid-cols-2 gap-3"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          {categoryOptions.map((cat) => (
            <motion.button
              key={cat}
              variants={cardIn}
              whileTap={isHost ? { scale: 0.93 } : undefined}
              whileHover={isHost ? { scale: 1.04, boxShadow: '0 0 24px 4px rgba(255,93,162,0.15)' } : undefined}
              onClick={() => isHost && pickCategory(cat)}
              className={`
                glass p-4 text-center font-bold text-lg cursor-pointer
                hover:bg-white/8 transition-colors hover-glow
                ${!isHost ? 'pointer-events-none opacity-50' : ''}
              `}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span className="text-2xl block mb-1">{getCategoryEmoji(cat)}</span>
              {getCategoryLabel(cat)}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
