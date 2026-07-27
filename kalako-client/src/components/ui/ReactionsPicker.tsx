import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { useTranslation } from '@/i18n/context'

const EMOJIS = ['😂', '😭', '🔥', '🤯', '💀', '👀']

export default function ReactionsPicker() {
  const { reactionsEnabled, activeReactions, sendReaction } = useGameStore()
  const t = useTranslation()

  if (!reactionsEnabled) return null

  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-3">
      <div
        className="flex gap-2 justify-center"
        role="toolbar"
        aria-label={t.reactionsPickerAria}
      >
        {EMOJIS.map((emoji) => (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => sendReaction(emoji)}
            className="text-2xl cursor-pointer hover:bg-white/10 rounded-lg p-1.5 transition-colors"
            aria-label={`${t.reactionsPickerAria}: ${emoji}`}
          >
            {emoji}
          </motion.button>
        ))}
      </div>

      <div className="relative h-0 w-full pointer-events-none">
        <AnimatePresence>
          {activeReactions.map((r) => (
            <motion.span
              key={r.id}
              initial={{ opacity: 1, y: 0, x: 0 }}
              animate={{ opacity: 0, y: -40, x: (r.id % 3 - 1) * 20 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
              className="absolute start-1/2 text-xl"
              style={{ left: `${40 + (r.id % 5) * 5}%` }}
            >
              {r.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
