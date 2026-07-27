import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import ThemedQRCode from '@/components/brand/ThemedQRCode'
import { ComposedAvatar } from '@/components/avatarParts'
import { getAvatarConfig } from '@/lib/avatarUtils'
import PremiumBadge from '@/components/ui/PremiumBadge'
import { useGameStore } from '@/store/gameStore'
import { useTranslation } from '@/i18n/context'

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
}
const cardIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
}

export default function Lobby() {
  const { room, playerId, startGame, leaveRoom, updateRoomSettings } = useGameStore()
  const t = useTranslation()
  const prefersReducedMotion = useReducedMotion()
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedWatchLink, setCopiedWatchLink] = useState(false)
  const [applyingRecommended, setApplyingRecommended] = useState(false)

  if (!room) return null

  const isHost = room.hostId === playerId
  const baseUrl = window.location.origin
  const inviteLink = `${baseUrl}?join=${room.code}`
  const watchLink = `${baseUrl}?display=${room.code}`

  const copyCode = async () => {
    await navigator.clipboard.writeText(room.code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const copyWatchLink = async () => {
    await navigator.clipboard.writeText(watchLink)
    setCopiedWatchLink(true)
    setTimeout(() => setCopiedWatchLink(false), 2000)
  }

  // Advisory only, per spec: shown alongside the host's chosen roundsCount, never overrides
  // it automatically. playerCount here deliberately excludes displays (Watch Mode spectators
  // never count toward this formula).
  const recommendedRounds = room.players.length * 2
  const recommendationDiffers = recommendedRounds !== room.settings.roundsCount
  const handleUseRecommended = async () => {
    setApplyingRecommended(true)
    await updateRoomSettings({ roundsCount: recommendedRounds })
    setApplyingRecommended(false)
  }

  return (
    <div className="flex flex-col items-center min-h-dvh px-4 py-6 gap-5 pt-16">
      <div className="w-full max-w-sm flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-gradient" style={{ fontFamily: 'var(--font-heading)' }}>
            {t.lobbyTitle}
          </h1>
          <Badge variant="secondary">
            {room.settings.isPrivate ? t.privateBadge : t.publicBadge}
          </Badge>
        </div>

        <GlassCard strong>
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <p className="text-white/50 text-xs mb-2">{t.roomCodeLabel}</p>
              <motion.p
                className="text-3xl font-black tracking-widest text-primary select-all"
                dir="ltr"
                animate={prefersReducedMotion ? {} : { scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                {room.code}
              </motion.p>
            </div>

            <div className="flex gap-2 w-full">
              <Button variant="primary" size="sm" fullWidth onClick={copyCode}>
                {copiedCode ? t.copiedCode : t.copyCode}
              </Button>
              <Button variant="secondary" size="sm" fullWidth onClick={copyLink}>
                {copiedLink ? t.copiedLink : t.copyLink}
              </Button>
            </div>

            <ThemedQRCode value={inviteLink} size={120} />
            <p className="text-white/50 text-xs text-center">{t.scanToJoin}</p>

            <div className="w-full pt-2 border-t border-white/10 flex flex-col items-center gap-2">
              <Button variant="ghost" size="sm" fullWidth onClick={copyWatchLink}>
                📺 {copiedWatchLink ? t.copiedLink : t.lobbyWatchOnTv}
              </Button>
              {!!room.displayCount && room.displayCount > 0 && (
                <p className="text-white/40 text-[11px]">
                  {room.displayCount === 1 ? t.lobbyDisplayCountOne : t.lobbyDisplayCount.replace('{{count}}', String(room.displayCount))}
                </p>
              )}
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white/60">
                {t.players} ({room.players.length})
              </h2>
            </div>
            <motion.div
              className="grid grid-cols-4 gap-4"
              variants={stagger}
              initial="initial"
              animate="animate"
            >
              {room.players.map((p, idx) => (
                <motion.div
                  key={p.id}
                  variants={cardIn}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="relative">
                    <div className={`${!p.connected ? 'opacity-40 grayscale' : ''}`}>
                      <ComposedAvatar {...getAvatarConfig(idx)} size={60} />
                    </div>
                    {!p.connected && (
                      <span className="absolute -bottom-1 start-1/2 -translate-x-1/2 text-[9px] bg-red-500/80 text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">
                        {t.playerDisconnected}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-medium truncate max-w-16 ${p.id === playerId ? 'text-primary' : 'text-white/60'}`}>
                      {p.name}
                    </span>
                    {p.isPremium && <PremiumBadge size={12} />}
                    {p.isHost && (
                      <span className="text-[10px] text-warning">👑</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-3">
          {room.tournament && (
            <div className="text-center text-xs font-bold text-primary">
              🏆 {t.tournamentGameLabel.replace('{{current}}', String(room.tournament.gameIndex)).replace('{{total}}', String(room.tournament.totalGames))}
            </div>
          )}

          <div className="flex gap-3 text-xs text-white/50 justify-center">
            <span>{room.settings.answerTimeSeconds}{t.sec} {t.timeLabel}</span>
            <span>•</span>
            <span>{room.settings.roundsCount} {t.roundsLabel}</span>
          </div>

          {isHost && recommendationDiffers && (
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs">
              <span className="text-white/60">
                {t.lobbyRecommendedRounds.replace('{{count}}', String(recommendedRounds)).replace('{{players}}', String(room.players.length))}
              </span>
              <button
                onClick={handleUseRecommended}
                disabled={applyingRecommended}
                className="text-primary font-bold whitespace-nowrap hover:text-primary/80 transition-colors cursor-pointer disabled:opacity-50"
              >
                {t.lobbyUseRecommended}
              </button>
            </div>
          )}

          {isHost ? (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={room.players.length < 2}
              onClick={startGame}
            >
              {t.startGame} ({room.players.length} {t.playerCount}{room.players.length !== 1 ? (t.lang === 'ar' ? 'ين' : t.lang === 'he' ? 'ים' : 's') : ''})
            </Button>
          ) : (
            <motion.div
              className="text-center text-white/50 text-sm py-3"
              animate={prefersReducedMotion ? {} : { opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {t.waitingForHost}
            </motion.div>
          )}

          <Button variant="ghost" size="sm" fullWidth onClick={leaveRoom}>
            {t.leaveRoom}
          </Button>
        </div>
      </div>
    </div>
  )
}
