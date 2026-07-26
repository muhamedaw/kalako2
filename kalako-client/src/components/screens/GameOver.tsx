import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import { ComposedAvatar } from '@/components/avatarParts'
import { getAvatarConfig } from '@/lib/avatarUtils'
import PremiumBadge from '@/components/ui/PremiumBadge'
import ResultsShareCard from '@/components/brand/ResultsShareCard'
import MostDeceptive from '@/components/brand/icons/MostDeceptive'
import { useGameStore } from '@/store/gameStore'
import { fireConfetti, captureScreenshot } from '@/lib/helpers'
import { useTranslation } from '@/i18n/context'

const stagger = {
  animate: { transition: { staggerChildren: 0.15 } },
}
const medalIn = {
  initial: { opacity: 0, x: 30, scale: 0.9 },
  animate: { opacity: 1, x: 0, scale: 1 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
}

export default function GameOver() {
  const { finalStandings, room, playerId, disconnect, mostDeceptivePlayer } = useGameStore()
  const t = useTranslation()
  const prefersReducedMotion = useReducedMotion()
  const confettiFired = useRef(false)
  const [shareDataUrl, setShareDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!confettiFired.current && finalStandings && finalStandings.length > 0) {
      confettiFired.current = true
      fireConfetti()
    }
  }, [finalStandings])

  if (!finalStandings || !room) return null

  const medals = [t.medal1, t.medal2, t.medal3]
  const topPlayer = finalStandings[0]

  return (
    <div className="flex flex-col items-center min-h-dvh px-4 py-6 gap-5">
      <div className="w-full max-w-sm flex flex-col gap-5" id="game-over-screen">
        <motion.h1
          className="text-2xl font-black text-gradient text-center"
          style={{ fontFamily: 'var(--font-heading)' }}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t.gameOverTitle}
        </motion.h1>

        <GlassCard strong className="w-full">
          <div className="flex flex-col gap-4">
            <p className="text-center text-white/50 text-sm font-bold">{t.finalStandings}</p>
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="flex flex-col gap-3"
            >
              {finalStandings.slice(0, 3).map((p, i) => {
                const isMe = p.id === playerId
                const isMostDeceptive = mostDeceptivePlayer?.id === p.id
                return (
                  <motion.div
                    key={p.id}
                    variants={medalIn}
                    className={`flex items-center gap-3 p-3 rounded-xl ${isMe ? 'bg-primary/10 border border-primary/20' : 'bg-white/5'}`}
                  >
                    <motion.span
                      className="text-2xl"
                      animate={i === 0 && !prefersReducedMotion ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {medals[i]}
                    </motion.span>
                    <div className="relative">
                      <div className={`${!p.id || !room.players.find((rp) => rp.id === p.id)?.connected ? 'opacity-40 grayscale' : ''}`}>
                        <ComposedAvatar {...getAvatarConfig(i)} size={44} />
                      </div>
                      {(!p.id || !room.players.find((rp) => rp.id === p.id)?.connected) && (
                        <span className="absolute -bottom-1 start-1/2 -translate-x-1/2 text-[9px] bg-red-500/80 text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">
                          {t.playerDisconnected}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <p className={`font-bold ${isMe ? 'text-primary' : 'text-white'}`}>
                          {p.name} {isMe && t.youLabel}
                        </p>
                        {(p as any).isPremium && <PremiumBadge size={14} />}
                        {isMostDeceptive && <MostDeceptive size={24} />}
                      </div>
                    </div>
                    <Badge variant={i === 0 ? 'success' : 'secondary'}>
                      {p.score} {t.points}
                    </Badge>
                  </motion.div>
                )
              })}
            </motion.div>
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
                  link.download = `kalako-${Date.now()}.png`
                  link.href = shareDataUrl
                  link.click()
                } else {
                  captureScreenshot('game-over-screen')
                }
              }}
            >
              {t.saveImage}
            </Button>
            <Button
              variant="ghost"
              size="md"
              fullWidth
              onClick={disconnect}
            >
              {t.exit}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
