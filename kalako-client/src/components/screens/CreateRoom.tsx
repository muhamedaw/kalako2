import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Toggle, Select, ChipGroup } from '@/components/ui/FormControls'
import { useGameStore } from '@/store/gameStore'
import { CATEGORIES } from '@/types'

export default function CreateRoom() {
  const { createRoom, setScreen } = useGameStore()
  const [playerName, setPlayerName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [answerTime, setAnswerTime] = useState('45')
  const [roundCount, setRoundCount] = useState('5')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['general'])

  const handleCreate = () => {
    if (!playerName.trim()) return
    createRoom(playerName.trim(), {
      isPrivate,
      answerTimeSeconds: Number(answerTime),
      roundsCount: Number(roundCount),
      allowedCategories: selectedCategories,
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

        <div className="flex flex-col gap-5">
          <Input
            label="اسمك"
            placeholder="اكتب اسمك هنا..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
          />

          <Toggle
            checked={isPrivate}
            onChange={setIsPrivate}
            label="غرفة خاصة (للمدعوين فقط)"
          />

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

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-white/60">التصنيفات</span>
            <ChipGroup
              items={CATEGORIES}
              selected={selectedCategories}
              onToggle={toggleCategory}
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!playerName.trim() || selectedCategories.length === 0}
            onClick={handleCreate}
          >
            إنشاء الغرفة
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
