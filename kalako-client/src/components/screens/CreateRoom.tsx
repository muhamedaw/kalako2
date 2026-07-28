import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Toggle, Select, ChipGroup } from '@/components/ui/FormControls'
import ScoreMultiplier from '@/components/brand/icons/ScoreMultiplier'
import BlindVote from '@/components/brand/icons/BlindVote'
import FamilyAdults from '@/components/brand/icons/FamilyAdults'
import { useGameStore } from '@/store/gameStore'
import { useTranslation } from '@/i18n/context'
import { CATEGORIES, PREMIUM_CATEGORY_IDS, getCategoryLabel, getCategoryEmoji } from '@/types'

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
}
const itemIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
}

export default function CreateRoom() {
  const { createRoom, setScreen, profile, isPremium, createRoomDraft, updateCreateRoomDraft, resetCreateRoomDraft, serverCategories } = useGameStore()
  const t = useTranslation()
  // Draft lives in the shared store (not local useState) so it survives a detour to
  // Store/Premium (e.g. tapping a locked category) and back — the component remounts on
  // every screen switch, but the store doesn't. See resetCreateRoomDraft() call sites for
  // the two places this intentionally clears: the explicit Back button below, and a
  // successful create_room ack in gameStore.ts.
  const {
    playerName, roomName, isPrivate, answerTimeSeconds: answerTime, roundsCount: roundCount,
    selectedCategories, scoreMultiplierEnabled, isBlindVote, ageRating, tournamentMode,
  } = createRoomDraft

  const ownsCategory = (id: string) =>
    isPremium || (profile?.inventory ?? []).some((i) => i.itemId === `category_unlock_${id}`)

  // Prefer the live server list (reflects categories added via the admin dashboard, which
  // the static CATEGORIES array never did) — fall back to the static list only until the
  // first get_categories fetch resolves (e.g. a very slow connection right after load).
  const availableCategories = serverCategories.length > 0
    ? serverCategories.map((c) => ({
        id: c.id,
        label: c.displayNames[t.lang] || getCategoryLabel(c.id, t.lang),
        emoji: getCategoryEmoji(c.id),
      }))
    : CATEGORIES

  const handleBack = () => {
    resetCreateRoomDraft()
    setScreen('welcome')
  }

  const handleCreate = () => {
    if (!playerName.trim()) return
    createRoom(playerName.trim(), {
      roomName: roomName.trim() || undefined,
      isPrivate,
      answerTimeSeconds: Number(answerTime),
      roundsCount: Number(roundCount),
      // The server silently drops any premium category the device hasn't unlocked — this
      // client-side filter just keeps the UI honest about what will actually apply.
      allowedCategories: selectedCategories.filter((id) => !PREMIUM_CATEGORY_IDS.has(id) || ownsCategory(id)),
      scoreMultiplierEnabled,
      isBlindVote,
      ageRating,
      tournamentMode,
    })
  }

  const toggleCategory = (id: string) => {
    if (PREMIUM_CATEGORY_IDS.has(id) && !ownsCategory(id)) {
      setScreen('store')
      return
    }
    updateCreateRoomDraft({
      selectedCategories: selectedCategories.includes(id)
        ? selectedCategories.filter((c) => c !== id)
        : [...selectedCategories, id],
    })
  }

  return (
    <div className="flex flex-col items-center min-h-dvh px-4 py-8 gap-6 pt-16">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-sm"
      >
        <button
          onClick={handleBack}
          className="text-white/60 text-sm mb-4 hover:text-white/90 transition-colors cursor-pointer"
        >
          {t.back}
        </button>

        <h1 className="text-2xl font-black text-gradient mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
          {t.createRoomTitle}
        </h1>

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
              onChange={(e) => updateCreateRoomDraft({ playerName: e.target.value })}
              maxLength={20}
            />
          </motion.div>

          <motion.div variants={itemIn}>
            <Input
              label={t.createRoomNameLabel}
              placeholder={t.createRoomNamePlaceholder}
              value={roomName}
              onChange={(e) => updateCreateRoomDraft({ roomName: e.target.value })}
              maxLength={30}
            />
          </motion.div>

          <motion.div variants={itemIn}>
            <Toggle
              checked={isPrivate}
              onChange={(v) => updateCreateRoomDraft({ isPrivate: v })}
              label={t.privateRoom}
            />
          </motion.div>

          <motion.div variants={itemIn}>
            <Select
              value={answerTime}
              onChange={(v) => updateCreateRoomDraft({ answerTimeSeconds: v })}
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
              onChange={(v) => updateCreateRoomDraft({ roundsCount: v })}
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
              items={availableCategories.map((c) => {
                const locked = PREMIUM_CATEGORY_IDS.has(c.id) && !ownsCategory(c.id)
                return {
                  id: c.id,
                  label: locked ? `🔒 ${getCategoryLabel(c.id, t.lang)}` : getCategoryLabel(c.id, t.lang),
                  emoji: locked ? '' : c.emoji,
                }
              })}
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
                onChange={(v) => updateCreateRoomDraft({ scoreMultiplierEnabled: v })}
                label={`${t.scoreMultiplier} (${t.scoreMultiplierDesc})`}
              />
            </div>
            <div className="flex items-center gap-3">
              <BlindVote size={32} />
              <Toggle
                checked={isBlindVote}
                onChange={(v) => updateCreateRoomDraft({ isBlindVote: v })}
                label={`${t.blindVote} (${t.blindVoteDesc})`}
              />
            </div>
            <div className="flex items-center gap-3">
              <FamilyAdults size={32} variant={ageRating === 'adults' ? 'adults' : 'family'} />
              <Toggle
                checked={ageRating === 'adults'}
                onChange={(v) => updateCreateRoomDraft({ ageRating: v ? 'adults' : 'all' })}
                label={`${t.adultsOnly} (${t.adultsOnlyDesc})`}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <Toggle
                checked={tournamentMode}
                onChange={(v) => updateCreateRoomDraft({ tournamentMode: v })}
                label={`${t.tournamentModeLabel} (${t.tournamentModeDesc})`}
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
