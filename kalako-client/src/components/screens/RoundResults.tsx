import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/FormControls'
import Avatar from '@/components/brand/Avatar'
import { useGameStore } from '@/store/gameStore'
import { useSFX } from '@/components/brand/useSFX'

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
}
const itemIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
}

export default function RoundResults() {
  const { roundResults, room, playerId, wasDoublePoints } = useGameStore()
  const sfx = useSFX()
  const playedRef = useRef(false)

  useEffect(() => {
    if (!playedRef.current && roundResults) {
      playedRef.current = true
      const myAnswer = roundResults.answers.find((a) => a.playerId === playerId)
      if (myAnswer) {
        const isCorrect = myAnswer.text === roundResults.correctAnswer
        if (isCorrect) sfx.playCorrect()
        else sfx.playTricked()
      }
    }
  }, [roundResults, playerId, sfx])

  if (!roundResults || !room) return null

  return (
    <div className="flex flex-col items-center min-h-dvh px-4 py-6 gap-5">
      <div className="w-full max-w-sm flex flex-col gap-5">
        <h2 className="text-xl font-black text-gradient text-center" style={{ fontFamily: 'var(--font-heading)' }}>
          نتائج الجولة {room.round}
          {wasDoublePoints && <span className="text-warning text-sm mr-2">⚡ ×2 نقاط</span>}
        </h2>

        <GlassCard strong className="w-full">
          <div className="flex flex-col gap-3 text-center">
            <p className="text-white/40 text-xs">الإجابة الصحيحة</p>
            <motion.div
              className="p-3 rounded-xl bg-success/10 border border-success/20"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <p className="text-success text-lg font-bold">{roundResults.correctAnswer}</p>
            </motion.div>
          </div>
        </GlassCard>

        <motion.div
          className="flex flex-col gap-3"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          <p className="text-sm text-white/50 font-bold">الإجابات والتصويت</p>
          {roundResults.answers.map((a, i) => {
            const isCorrect = a.text === roundResults.correctAnswer
            const pIdx = room.players.findIndex((p) => p.id === a.playerId)
            const state = isCorrect ? 'happy' as const : 'tricked' as const
            return (
              <motion.div
                key={a.playerId + i}
                variants={itemIn}
                className={`glass p-3 flex items-center gap-3 ${isCorrect ? 'border-success/30 bg-success/5' : ''}`}
              >
                <div className="flex-shrink-0">
                  <Avatar
                    id={(pIdx >= 0 ? pIdx % 16 : 0) + 1}
                    state={state}
                    size={48}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{a.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {a.votesReceived !== undefined && (
                      <Badge variant={isCorrect ? 'success' : 'warning'}>
                        {a.votesReceived} صوت
                      </Badge>
                    )}
                    {a.pointsAwarded > 0 && (
                      <Badge variant="success">+{a.pointsAwarded} نقطة</Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <GlassCard className="w-full">
          <p className="text-sm text-white/50 font-bold text-center mb-3">الترتيب</p>
          {roundResults.scores.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              className="flex items-center justify-between py-1.5"
            >
              <span className={`text-sm ${p.id === playerId ? 'text-primary font-bold' : 'text-white/70'}`}>
                {p.name} {p.id === playerId && '(أنت)'}
              </span>
              <span className="text-sm font-bold text-white/80">{p.score}</span>
            </motion.div>
          ))}
        </GlassCard>
      </div>
    </div>
  )
}
