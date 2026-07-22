import { useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/FormControls'
import ThemedQRCode from '@/components/brand/ThemedQRCode'
import Avatar from '@/components/brand/Avatar'
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
  const { room, playerId, startGame, leaveRoom } = useGameStore()
  const t = useTranslation()
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  if (!room) return null

  const isHost = room.hostId === playerId
  const baseUrl = window.location.origin
  const inviteLink = `${baseUrl}?join=${room.code}`

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

  return (
    <div className="flex flex-col items-center min-h-dvh px-4 py-6 gap-5 pt-16">
      <div className="w-full max-w-sm flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gradient" style={{ fontFamily: 'var(--font-heading)' }}>
            {t.lobbyTitle}
          </h2>
          <Badge variant="secondary">
            {room.settings.isPrivate ? t.privateBadge : t.publicBadge}
          </Badge>
        </div>

        <GlassCard strong>
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <p className="text-white/40 text-xs mb-2">{t.roomCodeLabel}</p>
              <motion.p
                className="text-3xl font-black tracking-widest text-primary select-all"
                dir="ltr"
                animate={{ scale: [1, 1.02, 1] }}
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
            <p className="text-white/30 text-xs text-center">{t.scanToJoin}</p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white/60">
                {t.players} ({room.players.length})
              </h3>
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
                  <div className={`relative ${!p.connected ? 'opacity-30 grayscale' : ''}`}>
                    <Avatar id={(idx % 16) + 1} state="idle" size={60} />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-medium truncate max-w-16 ${p.id === playerId ? 'text-primary' : 'text-white/60'}`}>
                      {p.name}
                    </span>
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
          <div className="flex gap-3 text-xs text-white/40 justify-center">
            <span>{room.settings.answerTimeSeconds}{t.sec} {t.timeLabel}</span>
            <span>•</span>
            <span>{room.settings.roundsCount} {t.roundsLabel}</span>
          </div>

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
              className="text-center text-white/40 text-sm py-3"
              animate={{ opacity: [0.4, 1, 0.4] }}
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
