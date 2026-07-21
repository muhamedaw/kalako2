import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { useSFX } from '@/components/brand/useSFX'

export default function VoteScreen() {
  const { voteSlots, submittedVote, submitVote, mySlotId, votedCount, totalPlayers } = useGameStore()
  const sfx = useSFX()
  const playedRef = useRef(false)

  useEffect(() => {
    if (!playedRef.current && voteSlots.length > 0) {
      playedRef.current = true
      sfx.playVoteStart()
    }
  }, [voteSlots, sfx])

  return (
    <div className="flex flex-col items-center min-h-dvh px-4 py-6 gap-5">
      <div className="w-full max-w-sm flex flex-col gap-5">
        <div className="text-center">
          <h2 className="text-lg font-black text-gradient mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
            أيهم الإجابة الصحيحة؟
          </h2>
          <p className="text-white/40 text-xs">اختر الإجابة التي تظنها صحيحة — الإجابات مخفية بلا أسماء</p>
        </div>

        <div className="flex flex-col gap-3">
          {voteSlots.map((slot, i) => {
            const isMyAnswer = slot.slotId === mySlotId
            return (
              <motion.button
                key={slot.slotId}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.25 }}
                whileTap={!submittedVote && !isMyAnswer ? { scale: 0.97 } : undefined}
                whileHover={!submittedVote && !isMyAnswer ? { scale: 1.01, backgroundColor: 'rgba(255,255,255,0.08)' } : undefined}
                onClick={() => !submittedVote && !isMyAnswer && submitVote(slot.slotId)}
                disabled={submittedVote || isMyAnswer}
                className={`
                  glass p-4 text-center text-lg font-medium
                  transition-colors cursor-pointer hover-glow
                  ${isMyAnswer ? 'opacity-30 cursor-not-allowed border-primary/20' : ''}
                  ${submittedVote && !isMyAnswer ? 'opacity-50 pointer-events-none' : ''}
                `}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {slot.text}
                {isMyAnswer && <span className="text-xs text-primary mr-2">(إجابتك)</span>}
              </motion.button>
            )
          })}
        </div>

        {submittedVote && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-2 animate-pulse-success"
          >
            <p className="text-success text-sm font-bold py-2">
              ✓ تم تسجيل تصويتك
            </p>
            {totalPlayers > 0 && (
              <div className="w-full flex flex-col items-center gap-1">
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-secondary"
                    initial={{ width: 0 }}
                    animate={{ width: `${(votedCount / totalPlayers) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-white/40 text-xs">
                  {votedCount}/{totalPlayers} صوّتوا
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
