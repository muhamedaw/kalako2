import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Coins, Pencil, Check, X } from 'lucide-react'
import { useTranslation } from '@/i18n/context'
import { useGameStore } from '@/store/gameStore'
import { AVATARS } from '@/types'
import GlassCard from '@/components/ui/GlassCard'

export default function ProfileScreen() {
  const t = useTranslation()
  const { profile, loadProfile, updateProfileNickname } = useGameStore()
  const [editing, setEditing] = useState(false)
  const [nickname, setNickname] = useState('')

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  useEffect(() => {
    if (profile) setNickname(profile.nickname)
  }, [profile?.nickname])

  const handleSave = () => {
    if (nickname.trim()) {
      updateProfileNickname(nickname.trim())
      setEditing(false)
    }
  }

  const handleCancel = () => {
    setNickname(profile?.nickname || '')
    setEditing(false)
  }

  const inventoryCount = profile?.inventory?.length || 0

  return (
    <div className="flex flex-col min-h-dvh px-4 gap-4 pt-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black text-gradient text-center"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {t.navProfile}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-20 h-20 rounded-2xl bg-white/10 border-4 border-[#0A0A0A] flex items-center justify-center text-4xl shadow-[4px_4px_0_#0A0A0A]">
          {AVATARS[(profile?.avatarId ?? 1) - 1] || AVATARS[0]}
        </div>

        {editing ? (
          <div className="flex items-center gap-2 w-full max-w-xs">
            <div className="flex-1">
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={24}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border-4 border-[#0A0A0A] text-white text-base font-bold text-center shadow-[3px_3px_0_#0A0A0A] focus:outline-none focus:ring-2 focus:ring-primary/50"
                style={{ fontFamily: 'var(--font-heading)' }}
              />
            </div>
            <button
              onClick={handleSave}
              className="w-10 h-10 rounded-xl bg-green-400 border-4 border-[#0A0A0A] flex items-center justify-center shadow-[3px_3px_0_#0A0A0A] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#0A0A0A] transition-all cursor-pointer"
            >
              <Check size={20} className="text-[#0A0A0A]" strokeWidth={3} />
            </button>
            <button
              onClick={handleCancel}
              className="w-10 h-10 rounded-xl bg-white/20 border-4 border-[#0A0A0A] flex items-center justify-center shadow-[3px_3px_0_#0A0A0A] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#0A0A0A] transition-all cursor-pointer"
            >
              <X size={20} className="text-white" strokeWidth={3} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2
              className="text-xl font-bold text-white"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {profile?.nickname || '...'}
            </h2>
            <button
              onClick={() => setEditing(true)}
              className="w-8 h-8 rounded-lg bg-white/10 border-2 border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
            >
              <Pencil size={14} className="text-white/60" strokeWidth={2} />
            </button>
          </div>
        )}
      </motion.div>

      <GlassCard className="flex flex-row items-center justify-between">
        <span className="text-white/60 text-sm font-medium" style={{ fontFamily: 'var(--font-body)' }}>
          {t.profileCoinsLabel}
        </span>
        <span className="flex items-center gap-1.5 text-lg font-bold text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
          <Coins size={20} className="text-primary" strokeWidth={2.5} />
          {profile?.coins ?? 0}
        </span>
      </GlassCard>

      <GlassCard>
        <h3 className="text-sm font-bold text-white/80 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          {t.profileInventoryTitle}
        </h3>
        {inventoryCount === 0 ? (
          <p className="text-white/40 text-sm text-center py-4" style={{ fontFamily: 'var(--font-body)' }}>
            {t.comingSoonSubtitle}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {profile!.inventory.map((item) => (
              <div
                key={item.itemId}
                className="bg-white/5 border-2 border-white/10 rounded-xl p-3 text-center text-xs text-white/70"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {item.itemId}
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
