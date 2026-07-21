import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import PlayerAvatar from '@/components/ui/PlayerAvatar'
import { Badge } from '@/components/ui/FormControls'
import { useGameStore } from '@/store/gameStore'
import { AVATARS } from '@/types'

export default function Lobby() {
  const { room, playerId, startGame, leaveRoom } = useGameStore()
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
    <div className="flex flex-col items-center min-h-dvh px-4 py-6 gap-5">
      <div className="w-full max-w-sm flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gradient" style={{ fontFamily: 'var(--font-heading)' }}>
            اللوبي
          </h2>
          <Badge variant="secondary">
            {room.settings.isPrivate ? '🔒 خاصة' : '🌐 عامة'}
          </Badge>
        </div>

        <GlassCard strong>
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <p className="text-white/40 text-xs mb-2">كود الغرفة</p>
              <p className="text-3xl font-black tracking-widest text-primary select-all" dir="ltr">
                {room.code}
              </p>
            </div>

            <div className="flex gap-2 w-full">
              <Button variant="primary" size="sm" fullWidth onClick={copyCode}>
                {copiedCode ? '✓ تم النسخ' : '📋 نسخ الكود'}
              </Button>
              <Button variant="secondary" size="sm" fullWidth onClick={copyLink}>
                {copiedLink ? '✓ تم النسخ' : '🔗 نسخ الرابط'}
              </Button>
            </div>

            <div className="p-3 bg-white rounded-xl">
              <QRCodeSVG
                value={inviteLink}
                size={120}
                bgColor="white"
                fgColor="#12071F"
                level="M"
              />
            </div>
            <p className="text-white/30 text-xs text-center">امسح الرمز للانضمام</p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white/60">
                اللاعبون ({room.players.length})
              </h3>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {room.players.map((p, i) => (
                <PlayerAvatar
                  key={p.id}
                  emoji={AVATARS[i % AVATARS.length]}
                  name={p.name}
                  isHost={p.isHost}
                  isCurrentPlayer={p.id === playerId}
                  isConnected={p.connected}
                />
              ))}
            </div>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-3">
          <div className="flex gap-3 text-xs text-white/40 justify-center">
            <span>{room.settings.answerTimeSeconds}ث وقت</span>
            <span>•</span>
            <span>{room.settings.roundsCount} جولات</span>
          </div>

          {isHost ? (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={room.players.length < 2}
              onClick={startGame}
            >
              ابدأ اللعبة ({room.players.length} لاعب{room.players.length > 1 ? 'ين' : ''})
            </Button>
          ) : (
            <div className="text-center text-white/40 text-sm py-3 animate-pulse">
              بانتظار المضيف للبدء...
            </div>
          )}

          <Button variant="ghost" size="sm" fullWidth onClick={leaveRoom}>
            مغادرة الغرفة
          </Button>
        </div>
      </div>
    </div>
  )
}
