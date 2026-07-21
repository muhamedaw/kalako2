import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { getCategoryLabel, getCategoryEmoji } from '@/types'

export default function CategoryPick() {
  const { room, playerId, categoryOptions, pickCategory } = useGameStore()

  if (!room) return null

  const isHost = room.hostId === playerId

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-4 py-8 gap-6">
      <div className="w-full max-w-sm flex flex-col gap-5">
        <div className="text-center">
          <h2 className="text-2xl font-black text-gradient mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            اختر التصنيف
          </h2>
          <p className="text-white/40 text-sm">
            {isHost ? 'اختر تصنيفاً لهذه الجولة' : 'بانتظار المضيف لاختيار التصنيف...'}
            {room.isTiebreakerRound && <span className="text-warning block mt-1">⚡ جولة فاصلة</span>}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {categoryOptions.map((cat, i) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => isHost && pickCategory(cat)}
              className={`
                glass p-4 text-center font-bold text-lg cursor-pointer
                hover:bg-white/8 transition-colors
                ${!isHost ? 'pointer-events-none opacity-50' : ''}
              `}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span className="text-2xl block mb-1">{getCategoryEmoji(cat)}</span>
              {getCategoryLabel(cat)}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
