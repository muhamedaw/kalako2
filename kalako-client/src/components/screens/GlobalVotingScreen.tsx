import { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Flame, Medal, Crown } from 'lucide-react'
import { useTranslation } from '@/i18n/context'
import { useGameStore } from '@/store/gameStore'
import { getCategoryEmoji } from '@/types'
import GlassCard from '@/components/ui/GlassCard'

const VOTED_KEY = 'kalako_voted_entries'

function getVotedEntries(): Set<string> {
  try {
    const raw = localStorage.getItem(VOTED_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function persistVoted(entryId: string) {
  try {
    const set = getVotedEntries()
    set.add(entryId)
    localStorage.setItem(VOTED_KEY, JSON.stringify([...set]))
  } catch { /* ignore */ }
}

const RANK_STYLES: Record<number, { icon: typeof Trophy; color: string; label: string }> = {
  1: { icon: Crown, color: '#FFD400', label: '🥇' },
  2: { icon: Medal, color: '#C0C0C0', label: '🥈' },
  3: { icon: Medal, color: '#CD7F32', label: '🥉' },
}

export default function GlobalVotingScreen() {
  const t = useTranslation()
  const { hallOfFame, hallOfFameLoading, loadHallOfFame, voteHallOfFameEntry } = useGameStore()

  useEffect(() => {
    loadHallOfFame()
  }, [loadHallOfFame])

  const handleVote = useCallback((entryId: string) => {
    if (getVotedEntries().has(entryId)) return
    voteHallOfFameEntry(entryId)
    persistVoted(entryId)
  }, [voteHallOfFameEntry])

  return (
    <div className="flex flex-col min-h-dvh px-4 gap-4 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1
          className="text-2xl font-black text-gradient"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {t.hallOfFameTitle}
        </h1>
        <p className="text-white/50 text-xs mt-1 max-w-xs mx-auto" style={{ fontFamily: 'var(--font-body)' }}>
          {t.hallOfFameSubtitle}
        </p>
      </motion.div>

      {hallOfFameLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : hallOfFame.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Trophy size={48} className="text-white/20" strokeWidth={1.5} />
          <p className="text-white/40 text-sm text-center" style={{ fontFamily: 'var(--font-body)' }}>
            {t.hallOfFameEmpty}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {hallOfFame.map((entry, index) => {
            const rank = index + 1
            const rankStyle = RANK_STYLES[rank]
            const voted = getVotedEntries().has(entry.id)
            const isPodium = rank <= 3

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
              >
                <GlassCard
                  className={`flex items-start gap-3 ${isPodium ? 'border-primary/30' : ''}`}
                  strong={isPodium}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 border-2 border-[#0A0A0A] flex items-center justify-center font-black text-sm shadow-[2px_2px_0_#0A0A0A]">
                    {rankStyle ? (
                      <rankStyle.icon size={18} color={rankStyle.color} strokeWidth={2.5} />
                    ) : (
                      <span className="text-white/40">#{rank}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-bold text-white leading-tight"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      "{entry.answerText}"
                    </p>
                    <p className="text-[11px] text-white/40 mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                      {getCategoryEmoji(entry.category)} {entry.playerName}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Flame size={14} className="text-orange-400" strokeWidth={2.5} />
                      <span className="text-xs font-bold text-orange-400" style={{ fontFamily: 'var(--font-heading)' }}>
                        {entry.voteCount}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleVote(entry.id)}
                    disabled={voted}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-xl border-4 border-[#0A0A0A] text-xs font-bold shadow-[3px_3px_0_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#0A0A0A] transition-all cursor-pointer ${
                      voted
                        ? 'bg-green-500/30 text-green-300 border-green-500/30 shadow-none'
                        : 'bg-primary text-[#0A0A0A]'
                    }`}
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {voted ? '✓' : `🔥 ${t.hallOfFameVoteButton}`}
                  </button>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
