import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import PlayerAvatar from '@/components/ui/PlayerAvatar'
import { Badge } from '@/components/ui/FormControls'
import { useGameStore } from '@/store/gameStore'
import { AVATARS } from '@/types'

export default function RoundResults() {
  const { roundResults, room, playerId } = useGameStore()

  if (!roundResults || !room) return null

  return (
    <div className="flex flex-col items-center min-h-dvh px-4 py-6 gap-5">
      <div className="w-full max-w-sm flex flex-col gap-5">
        <h2 className="text-xl font-black text-gradient text-center" style={{ fontFamily: 'var(--font-heading)' }}>
          نتائج الجولة {room.round}
        </h2>

        <GlassCard strong className="w-full">
          <div className="flex flex-col gap-3 text-center">
            <p className="text-white/40 text-xs">الإجابة الصحيحة</p>
            <div className="p-3 rounded-xl bg-success/10 border border-success/20">
              <p className="text-success text-lg font-bold">{roundResults.correctAnswer}</p>
            </div>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-3">
          <p className="text-sm text-white/50 font-bold">الإجابات والتصويت</p>
          {roundResults.answers.map((a, i) => {
            const isCorrect = a.text === roundResults.correctAnswer
            const pIdx = room.players.findIndex((p) => p.id === a.playerId)
            return (
              <motion.div
                key={a.playerId + i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`glass p-3 flex items-center gap-3 ${isCorrect ? 'border-success/30 bg-success/5' : ''}`}
              >
                <div className="flex-shrink-0">
                  <PlayerAvatar
                    emoji={AVATARS[pIdx >= 0 ? pIdx % AVATARS.length : 0]}
                    name={a.playerName}
                    isCurrentPlayer={a.playerId === playerId}
                    size="sm"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{a.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={isCorrect ? 'success' : 'warning'}>
                      {a.votesReceived} صوت
                    </Badge>
                    {a.pointsAwarded > 0 && (
                      <Badge variant="success">+{a.pointsAwarded} نقطة</Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <GlassCard className="w-full">
          <p className="text-sm text-white/50 font-bold text-center mb-3">الترتيب</p>
          {roundResults.scores.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-1.5">
              <span className={`text-sm ${p.id === playerId ? 'text-primary font-bold' : 'text-white/70'}`}>
                {p.name} {p.id === playerId && '(أنت)'}
              </span>
              <span className="text-sm font-bold text-white/80">{p.score}</span>
            </div>
          ))}
        </GlassCard>
      </div>
    </div>
  )
}
