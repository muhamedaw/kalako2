import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useGameStore } from '@/store/gameStore'
import { useShake } from '@/lib/useShake'

export default function JoinRoom() {
  const { joinRoom, setScreen, pendingJoinCode, serverError, setError } = useGameStore()
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState(pendingJoinCode ?? '')
  const inputRef = useRef<HTMLInputElement>(null)
  const { shaking, trigger: shake } = useShake()

  useEffect(() => {
    if (pendingJoinCode) {
      setRoomCode(pendingJoinCode)
      useGameStore.setState({ pendingJoinCode: undefined })
    }
  }, [pendingJoinCode])

  useEffect(() => {
    const target = !roomCode ? inputRef.current : document.querySelector<HTMLInputElement>('input[name="name"]')
    target?.focus()
  }, [])

  useEffect(() => {
    if (serverError) shake()
  }, [serverError, shake])

  const handleJoin = () => {
    if (!playerName.trim() || roomCode.trim().length < 4) return
    setError(null)
    joinRoom(roomCode.trim().toUpperCase(), playerName.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleJoin()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-4 py-8 gap-6">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-sm"
      >
        <button
          onClick={() => setScreen('welcome')}
          className="text-white/40 text-sm mb-4 hover:text-white/70 transition-colors cursor-pointer"
        >
          ← رجوع
        </button>

        <h2 className="text-2xl font-black text-gradient mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
          الانضمام لغرفة
        </h2>

        <div className={`flex flex-col gap-5 ${shaking ? 'animate-shake' : ''}`}>
          <Input
            name="name"
            label="اسمك"
            placeholder="اكتب اسمك هنا..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={20}
          />

          <Input
            ref={inputRef}
            label="كود الغرفة"
            placeholder="مثال: ABC123"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            maxLength={6}
            className="text-center text-xl tracking-widest font-bold"
            dir="ltr"
          />

          {serverError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-center px-3 py-2 rounded-xl bg-warning/10 border border-warning/20 text-warning"
            >
              {serverError}
            </motion.p>
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!playerName.trim() || roomCode.trim().length < 4}
            onClick={handleJoin}
          >
            انضم للغرفة
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
