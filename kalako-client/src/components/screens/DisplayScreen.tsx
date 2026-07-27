import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { useTranslation } from '@/i18n/context'
import { getCategoryLabel, getCategoryEmoji } from '@/types'
import PictureRoundImage from '@/components/ui/PictureRoundImage'
import LogoSquare from '@/components/brand/LogoSquare'

// TV/projector spectator view — large typography for viewing distance, no input controls at
// all (Watch Mode never submits answers/votes). Reads the exact same store fields a player's
// AnswerScreen/VoteScreen/RoundResults/GameOver would, since the display socket receives the
// identical phase_changed broadcasts; this is a scaled-up alternate renderer for that state,
// not a separate data path.
export default function DisplayScreen() {
  const {
    room, categoryOptions, questionText, questionCategory, questionImageUrl, questionSourceAttribution,
    voteSlots, roundResults, finalStandings, tournamentResult,
  } = useGameStore()
  const t = useTranslation()

  const phase = room?.phase

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-10 py-10 gap-8 text-center">
      <AnimatePresence mode="wait">
        {!room || phase === 'LOBBY' ? (
          <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6">
            <div className="w-32 h-32"><LogoSquare /></div>
            <p className="text-3xl text-white/60" style={{ fontFamily: 'var(--font-body)' }}>{t.displayScreenWaiting}</p>
            {room && (
              <p className="text-6xl font-black text-primary tracking-widest" dir="ltr" style={{ fontFamily: 'var(--font-heading)' }}>
                {room.code}
              </p>
            )}
          </motion.div>
        ) : phase === 'CATEGORY_PICK' ? (
          <motion.div key="catpick" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-8 w-full max-w-4xl">
            <h1 className="text-4xl font-black text-white/70" style={{ fontFamily: 'var(--font-heading)' }}>{t.categoryPickTitle}</h1>
            <div className="grid grid-cols-2 gap-6">
              {categoryOptions.map((cat) => (
                <div key={cat} className="glass p-8 rounded-2xl">
                  <span className="text-6xl block mb-3">{getCategoryEmoji(cat)}</span>
                  <span className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{getCategoryLabel(cat, t.lang)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : phase === 'ANSWERING' ? (
          <motion.div key="answering" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-8 w-full max-w-4xl">
            {questionCategory && (
              <span className="text-2xl font-bold text-primary">{getCategoryEmoji(questionCategory)} {getCategoryLabel(questionCategory, t.lang)}</span>
            )}
            {questionImageUrl && (
              <div className="max-w-xl mx-auto">
                <PictureRoundImage src={questionImageUrl} alt={questionText || ''} sourceAttribution={questionSourceAttribution} />
              </div>
            )}
            <h1 className="text-5xl font-black leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>{questionText}</h1>
          </motion.div>
        ) : phase === 'VOTING' ? (
          <motion.div key="voting" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6 w-full max-w-4xl">
            <h1 className="text-4xl font-black text-white/70" style={{ fontFamily: 'var(--font-heading)' }}>{t.pickCategoryWaiting}</h1>
            <div className="grid grid-cols-1 gap-4">
              {voteSlots.map((slot) => (
                <div key={slot.slotId} className="glass p-6 rounded-2xl text-3xl font-bold">{slot.text}</div>
              ))}
            </div>
          </motion.div>
        ) : phase === 'RESULTS' && roundResults ? (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6 w-full max-w-4xl">
            <p className="text-2xl text-white/50">{t.categoryPickTitle}</p>
            <h1 className="text-4xl font-black text-secondary" style={{ fontFamily: 'var(--font-heading)' }}>✓ {roundResults.correctAnswer}</h1>
            <div className="grid grid-cols-1 gap-3 mt-4">
              {roundResults.answers.map((a) => (
                <div key={a.playerId} className="glass p-5 rounded-2xl flex items-center justify-between text-2xl">
                  <span className="font-bold">{a.playerName}</span>
                  <span className="text-white/60">{a.text}</span>
                  <span className="font-black text-primary">+{a.pointsAwarded}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              {roundResults.scores.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-2xl font-bold glass p-4 rounded-xl">
                  <span>{p.name}</span>
                  <span className="text-primary">{p.score}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : phase === 'GAME_OVER' && finalStandings ? (
          <motion.div key="gameover" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6 w-full max-w-4xl">
            <h1 className="text-5xl font-black text-primary" style={{ fontFamily: 'var(--font-heading)' }}>🏆 {finalStandings[0]?.name}</h1>
            <div className="grid grid-cols-1 gap-3">
              {finalStandings.map((p, i) => (
                <div key={p.id} className="glass p-5 rounded-2xl flex items-center justify-between text-2xl font-bold">
                  <span>{i + 1}. {p.name}</span>
                  <span className="text-primary">{p.score}</span>
                </div>
              ))}
            </div>
            {tournamentResult && (
              <div className="mt-6 flex flex-col gap-3">
                <h2 className="text-3xl font-black text-secondary">
                  {tournamentResult.isFinalGame ? t.tournamentFinalStandings : t.tournamentStandingsTitle}
                </h2>
                {tournamentResult.cumulativeStandings.map((p, i) => (
                  <div key={p.id} className="glass p-4 rounded-xl flex items-center justify-between text-xl font-bold">
                    <span>{i + 1}. {p.name}</span>
                    <span className="text-secondary">{p.cumulativeScore}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="fallback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl text-white/50">
            {t.displayScreenWaiting}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
