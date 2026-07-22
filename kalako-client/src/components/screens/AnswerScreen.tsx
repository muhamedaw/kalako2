import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ProgressRing from '@/components/ui/ProgressRing'
import { useGameStore } from '@/store/gameStore'
import { useSFX } from '@/components/brand/useSFX'
import { useTranslation } from '@/i18n/context'

export default function AnswerScreen() {
  const {
    questionText,
    questionCategory,
    timeSeconds,
    submittedAnswer,
    submitAnswer,
    answeredCount,
    totalPlayers,
    room,
    isDoublePointsRound,
  } = useGameStore()
  const t = useTranslation()

  const [answer, setAnswer] = useState('')
  const answerRef = useRef('')
  const [timeLeft, setTimeLeft] = useState(timeSeconds)
  const intervalRef = useRef<number | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)
  const sfx = useSFX()

  answerRef.current = answer

  useEffect(() => {
    setTimeLeft(timeSeconds)
    inputRef.current?.focus()
  }, [timeSeconds])

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          const state = useGameStore.getState()
          if (!state.submittedAnswer && state.screen === 'answering') {
            const text = answerRef.current.trim()
            if (text) {
              state.submitAnswer(text)
            }
          }
          return 0
        }
        if (prev <= 5 && prev > 0) sfx.playCountdown()
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = () => {
    if (!answer.trim() || submittedAnswer) return
    clearInterval(intervalRef.current)
    submitAnswer(answer.trim())
    sfx.playSubmit()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="flex flex-col items-center min-h-dvh px-4 py-6 gap-5">
      <div className="w-full max-w-sm flex flex-col items-center gap-5">
        <ProgressRing progress={timeLeft} total={timeSeconds} size={100} strokeWidth={6} />

        <GlassCard strong className="w-full">
          <div className="flex flex-col gap-3 text-center">
            <div className="text-sm text-white/40">
              {t.round} {room?.round ?? 1}
              {questionCategory && <span className="mr-2 text-primary">• {questionCategory}</span>}
              {isDoublePointsRound && <span className="mr-2 text-warning">{t.doublePoints}</span>}
            </div>
            <h2
              className="text-xl sm:text-2xl font-black text-white"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {questionText || t.questionLoading}
            </h2>
          </div>
        </GlassCard>

        {!submittedAnswer ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col gap-3"
          >
            <Input
              ref={inputRef}
              placeholder={t.answerPlaceholder}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={140}
            />
            <div className="text-xs text-white/30 text-left" dir="ltr">
              {answer.length}/140
            </div>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!answer.trim()}
              onClick={handleSubmit}
            >
              {t.submitAnswer}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-6 text-center w-full animate-pulse-success"
          >
            <p className="text-success text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
              {t.answerSubmitted}
            </p>
            {totalPlayers > 0 && (
              <div className="mt-3 flex flex-col items-center gap-2">
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${(answeredCount / totalPlayers) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-white/40 text-sm">
                  {answeredCount}/{totalPlayers} {t.answeredCount}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
