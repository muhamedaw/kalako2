import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import Avatar from '@/components/brand/Avatar'
import ResultsShareCard from '@/components/brand/ResultsShareCard'
import MostDeceptive from '@/components/brand/icons/MostDeceptive'
import { useGameStore } from '@/store/gameStore'
import { fireConfetti, captureScreenshot } from '@/lib/helpers'

export default function GameOver() {
  const { finalStandings, room, playerId, disconnect, mostDeceptivePlayer } = useGameStore()
  const confettiFired = useRef(false)
  const [shareDataUrl, setShareDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!confettiFired.current && finalStandings && finalStandings.length > 0) {
      confettiFired.current = true
      fireConfetti()
    }
  }, [finalStandings])

  if (!finalStandings || !room) return null

  const medals = ['🥇', '🥈', '🥉']
  const topPlayer = finalStandings[0]

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
              const isMostDeceptive = mostDeceptivePlayer?.id === p.id
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: i === 0 ? 0 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className={`flex items-center gap-3 p-3 rounded-xl ${isMe ? 'bg-primary/10 border border-primary/20' : 'bg-white/5'}`}
                >
                  <span className="text-2xl">{medals[i]}</span>
                  <Avatar id={i + 1} state="happy" size={44} />
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <p className={`font-bold ${isMe ? 'text-primary' : 'text-white'}`}>
                        {p.name} {isMe && '(أنت)'}
                      </p>
                      {isMostDeceptive && <MostDeceptive size={24} />}
                    </div>
                  </div>
                  <Badge variant={i === 0 ? 'success' : 'secondary'}>
                    {p.score} نقطة
                  </Badge>
                </motion.div>
              )
            })}
          </div>
        </GlassCard>

        <div className="flex flex-col gap-3">
          <ResultsShareCard
            playerName={topPlayer.name}
            score={topPlayer.score}
            rank={1}
            totalPlayers={finalStandings.length}
            onDataUrl={setShareDataUrl}
          />
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => {
                if (shareDataUrl) {
                  const link = document.createElement('a')
                  link.download = `كلاكو-فائز-${Date.now()}.png`
                  link.href = shareDataUrl
                  link.click()
                } else {
                  captureScreenshot('game-over-screen')
                }
              }}
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
    </div>
  )
}
