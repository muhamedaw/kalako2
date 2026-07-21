import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Toggle, Select, ChipGroup } from '@/components/ui/FormControls'
import ScoreMultiplier from '@/components/brand/icons/ScoreMultiplier'
import BlindVote from '@/components/brand/icons/BlindVote'
import FamilyAdults from '@/components/brand/icons/FamilyAdults'
import { useGameStore } from '@/store/gameStore'

const CATEGORIES = [
  { id: 'general', label: 'عامة', emoji: '🌍' },
  { id: 'science', label: 'علوم', emoji: '🔬' },
  { id: 'history', label: 'تاريخ', emoji: '📜' },
  { id: 'geography', label: 'جغرافيا', emoji: '🗺️' },
  { id: 'sports', label: 'رياضة', emoji: '⚽' },
  { id: 'movies', label: 'أفلام', emoji: '🎬' },
  { id: 'celebrities', label: 'مشاهير', emoji: '⭐' },
  { id: 'cooking', label: 'طبخ', emoji: '🍳' },
]

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
    <div className="flex flex-col items-center min-h-dvh px-4 py-8 gap-6">
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
          إنشاء غرفة
        </h2>

        <motion.div
          className="flex flex-col gap-5"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={itemIn}>
            <Input
              label="اسمك"
              placeholder="اكتب اسمك هنا..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
            />
          </motion.div>

          <motion.div variants={itemIn}>
            <Toggle
              checked={isPrivate}
              onChange={setIsPrivate}
              label="غرفة خاصة (للمدعوين فقط)"
            />
          </motion.div>

          <motion.div variants={itemIn}>
            <Select
              value={answerTime}
              onChange={setAnswerTime}
              label="وقت الإجابة"
              options={[
                { value: '30', label: '30 ثانية' },
                { value: '45', label: '45 ثانية' },
                { value: '60', label: '60 ثانية' },
                { value: '90', label: '90 ثانية' },
              ]}
            />
          </motion.div>

          <motion.div variants={itemIn}>
            <Select
              value={roundCount}
              onChange={setRoundCount}
              label="عدد الجولات"
              options={[
                { value: '3', label: '3 جولات' },
                { value: '5', label: '5 جولات' },
                { value: '7', label: '7 جولات' },
                { value: '10', label: '10 جولات' },
              ]}
            />
          </motion.div>

          <motion.div variants={itemIn} className="flex flex-col gap-2">
            <span className="text-sm font-medium text-white/60">التصنيفات</span>
            <ChipGroup
              items={CATEGORIES}
              selected={selectedCategories}
              onToggle={toggleCategory}
            />
          </motion.div>

          <motion.div variants={itemIn} className="flex flex-col gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-sm font-bold text-white/60">خيارات متقدمة</p>
            <div className="flex items-center gap-3">
              <ScoreMultiplier size={32} />
              <Toggle
                checked={scoreMultiplierEnabled}
                onChange={setScoreMultiplierEnabled}
                label="مضاعف نقاط (ضعف النقاط في بعض الجولات)"
              />
            </div>
            <div className="flex items-center gap-3">
              <BlindVote size={32} />
              <Toggle
                checked={isBlindVote}
                onChange={setIsBlindVote}
                label="تصويت أعمى (لا تعرف من صوّت لك)"
              />
            </div>
            <div className="flex items-center gap-3">
              <FamilyAdults size={32} variant={ageRating === 'adults' ? 'adults' : 'family'} />
              <Toggle
                checked={ageRating === 'adults'}
                onChange={(v) => setAgeRating(v ? 'adults' : 'all')}
                label="جلسة كبار (للبالغين فقط)"
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
              إنشاء الغرفة
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
