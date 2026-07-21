import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import PlayerAvatar from '@/components/ui/PlayerAvatar'
import { Badge } from '@/components/ui/FormControls'
import { useGameStore } from '@/store/gameStore'
import { fireConfetti, captureScreenshot } from '@/lib/helpers'
import { AVATARS } from '@/types'

export default function GameOver() {
  const { finalStandings, room, playerId, disconnect } = useGameStore()
  const confettiFired = useRef(false)

  useEffect(() => {
    if (!confettiFired.current && finalStandings && finalStandings.length > 0) {
      confettiFired.current = true
      fireConfetti()
    }
  }, [finalStandings])

  if (!finalStandings || !room) return null

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="flex flex-col items-center min-h-dvh px-4 py-6 gap-5">
      <div className="w-full max-w-sm flex flex-col gap-5" id="game-over-screen">
        <h2 className="text-2xl font-black text-gradient text-center" style={{ fontFamily: 'var(--font-heading)' }}>
          انتهت اللعبة!
        </h2>

        <GlassCard strong className="w-full">
          <div className="flex flex-col gap-4">
            <p className="text-center text-white/40 text-sm font-bold">الترتيب النهائي</p>
            {finalStandings.slice(0, 3).map((p, i) => {
              const isMe = p.id === playerId
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: i === 0 ? 0 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className={`flex items-center gap-3 p-3 rounded-xl ${isMe ? 'bg-primary/10 border border-primary/20' : 'bg-white/5'}`}
                >
                  <span className="text-2xl">{medals[i]}</span>
                  <PlayerAvatar
                    emoji={AVATARS[i % AVATARS.length]}
                    name={p.name}
                    isCurrentPlayer={isMe}
                    size="sm"
                  />
                  <div className="flex-1">
                    <p className={`font-bold ${isMe ? 'text-primary' : 'text-white'}`}>
                      {p.name} {isMe && '(أنت)'}
                    </p>
                  </div>
                  <Badge variant={i === 0 ? 'success' : 'secondary'}>
                    {p.score} نقطة
                  </Badge>
                </motion.div>
              )
            })}
          </div>
        </GlassCard>

        <div className="flex gap-3">
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => captureScreenshot('game-over-screen')}
          >
            📸 حفظ كصورة
          </Button>
          <Button
            variant="ghost"
            size="md"
            fullWidth
            onClick={disconnect}
          >
            خروج
          </Button>
        </div>
      </div>
    </div>
  )
}
