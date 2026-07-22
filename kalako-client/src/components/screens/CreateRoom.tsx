import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Toggle, Select, ChipGroup } from '@/components/ui/FormControls'
import ScoreMultiplier from '@/components/brand/icons/ScoreMultiplier'
import BlindVote from '@/components/brand/icons/BlindVote'
import FamilyAdults from '@/components/brand/icons/FamilyAdults'
import { useGameStore } from '@/store/gameStore'
import { useTranslation } from '@/i18n/context'

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
}
const itemIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
}

export default function CreateRoom() {
  const { createRoom, setScreen } = useGameStore()
  const t = useTranslation()
  const [playerName, setPlayerName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [answerTime, setAnswerTime] = useState('45')
  const [roundCount, setRoundCount] = useState('5')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['general'])
  const [scoreMultiplierEnabled, setScoreMultiplierEnabled] = useState(false)
  const [isBlindVote, setIsBlindVote] = useState(false)
  const [ageRating, setAgeRating] = useState<'all' | 'adults'>('all')

  const handleCreate = () => {
    if (!playerName.trim()) return
    createRoom(playerName.trim(), {
      isPrivate,
      answerTimeSeconds: Number(answerTime),
      roundsCount: Number(roundCount),
      allowedCategories: selectedCategories,
      scoreMultiplierEnabled,
      isBlindVote,
      ageRating,
    })
  }

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  return (
    <div className="flex flex-col items-center min-h-dvh px-4 py-8 gap-6 pt-16">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-sm"
      >
        <button
          onClick={() => setScreen('welcome')}
          className="text-white/40 text-sm mb-4 hover:text-white/70 transition-colors cursor-pointer"
        >
          {t.back}
        </button>

        <h2 className="text-2xl font-black text-gradient mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
          {t.createRoomTitle}
        </h2>

        <motion.div
          className="flex flex-col gap-5"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={itemIn}>
            <Input
              label={t.yourName}
              placeholder={t.yourNamePlaceholder}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
            />
          </motion.div>

          <motion.div variants={itemIn}>
            <Toggle
              checked={isPrivate}
              onChange={setIsPrivate}
              label={t.privateRoom}
            />
          </motion.div>

          <motion.div variants={itemIn}>
            <Select
              value={answerTime}
              onChange={setAnswerTime}
              label={t.answerTime}
              options={[
                { value: '30', label: `30 ${t.sec}` },
                { value: '45', label: `45 ${t.sec}` },
                { value: '60', label: `60 ${t.sec}` },
                { value: '90', label: `90 ${t.sec}` },
              ]}
            />
          </motion.div>

          <motion.div variants={itemIn}>
            <Select
              value={roundCount}
              onChange={setRoundCount}
              label={t.rounds}
              options={[
                { value: '3', label: `3 ${t.roundsLabel}` },
                { value: '5', label: `5 ${t.roundsLabel}` },
                { value: '7', label: `7 ${t.roundsLabel}` },
                { value: '10', label: `10 ${t.roundsLabel}` },
              ]}
            />
          </motion.div>

          <motion.div variants={itemIn} className="flex flex-col gap-2">
            <span className="text-sm font-medium text-white/60">{t.categories}</span>
            <ChipGroup
              items={[
                { id: 'general', label: t.lang === 'ar' ? 'عامة' : t.lang === 'he' ? 'כללי' : 'General', emoji: '🌍' },
                { id: 'science', label: t.lang === 'ar' ? 'علوم' : t.lang === 'he' ? 'מדע' : 'Science', emoji: '🔬' },
                { id: 'history', label: t.lang === 'ar' ? 'تاريخ' : t.lang === 'he' ? 'היסטוריה' : 'History', emoji: '📜' },
                { id: 'geography', label: t.lang === 'ar' ? 'جغرافيا' : t.lang === 'he' ? 'גיאוגרפיה' : 'Geography', emoji: '🗺️' },
                { id: 'sports', label: t.lang === 'ar' ? 'رياضة' : t.lang === 'he' ? 'ספורט' : 'Sports', emoji: '⚽' },
                { id: 'movies', label: t.lang === 'ar' ? 'أفلام' : t.lang === 'he' ? 'סרטים' : 'Movies', emoji: '🎬' },
                { id: 'celebrities', label: t.lang === 'ar' ? 'مشاهير' : t.lang === 'he' ? 'סלבריטאים' : 'Celebrities', emoji: '⭐' },
                { id: 'cooking', label: t.lang === 'ar' ? 'طبخ' : t.lang === 'he' ? 'בישול' : 'Cooking', emoji: '🍳' },
              ]}
              selected={selectedCategories}
              onToggle={toggleCategory}
            />
          </motion.div>

          <motion.div variants={itemIn} className="flex flex-col gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-sm font-bold text-white/60">{t.advancedOptions}</p>
            <div className="flex items-center gap-3">
              <ScoreMultiplier size={32} />
              <Toggle
                checked={scoreMultiplierEnabled}
                onChange={setScoreMultiplierEnabled}
                label={`${t.scoreMultiplier} (${t.scoreMultiplierDesc})`}
              />
            </div>
            <div className="flex items-center gap-3">
              <BlindVote size={32} />
              <Toggle
                checked={isBlindVote}
                onChange={setIsBlindVote}
                label={`${t.blindVote} (${t.blindVoteDesc})`}
              />
            </div>
            <div className="flex items-center gap-3">
              <FamilyAdults size={32} variant={ageRating === 'adults' ? 'adults' : 'family'} />
              <Toggle
                checked={ageRating === 'adults'}
                onChange={(v) => setAgeRating(v ? 'adults' : 'all')}
                label={`${t.adultsOnly} (${t.adultsOnlyDesc})`}
              />
            </div>
          </motion.div>

          <motion.div variants={itemIn}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!playerName.trim() || selectedCategories.length === 0}
              onClick={handleCreate}
            >
              {t.createRoomBtn}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
