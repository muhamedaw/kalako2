import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Pencil, Check, X, Coins } from 'lucide-react'
import { useTranslation } from '@/i18n/context'
import { useGameStore } from '@/store/gameStore'
import { ComposedAvatar } from '@/components/avatarParts'
import { DEFAULT_AVATAR, FREE_BODIES, FREE_EYES, FREE_HATS, BODY_NAMES } from '@/components/avatarParts/types'
import type { BodyId, AvatarConfig } from '@/components/avatarParts/types'
import { parseAvatarConfig } from '@/lib/avatarUtils'
import GlassCard from '@/components/ui/GlassCard'

export default function ProfileScreen() {
  const t = useTranslation()
  const { profile, loadProfile, updateProfileNickname, updateProfileAvatar } = useGameStore()
  const [editing, setEditing] = useState(false)
  const [nickname, setNickname] = useState('')
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR)
  const [pickMode, setPickMode] = useState<'body' | 'eyes' | 'hat' | null>(null)

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname)
      if (profile.avatarConfig) {
        setAvatarConfig(parseAvatarConfig(profile.avatarConfig))
      }
    }
  }, [profile])

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

  return (
    <div className="flex flex-col min-h-dvh px-4 gap-4 pt-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black text-center"
        style={{ fontFamily: 'var(--font-heading)', color: '#FF6B35' }}
      >
        {t.navProfile}
      </motion.h1>

      <div className="flex flex-col items-center gap-3">
        <div className="w-24 h-24">
          <ComposedAvatar {...avatarConfig} size={96} />
        </div>

        {editing ? (
          <div className="flex items-center gap-2 w-full max-w-xs">
            <div className="flex-1">
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={24}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border-4 border-[#0A0A0A] text-white text-base font-bold text-center shadow-[3px_3px_0_#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
                style={{ fontFamily: 'var(--font-heading)' }}
              />
            </div>
            <button onClick={handleSave} aria-label={t.profileSaveAria} className="w-10 h-10 rounded-xl bg-[#C6FF3D] border-4 border-[#0A0A0A] flex items-center justify-center shadow-[3px_3px_0_#0A0A0A] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#0A0A0A] transition-all cursor-pointer">
              <Check size={20} className="text-[#0A0A0A]" strokeWidth={3} />
            </button>
            <button onClick={handleCancel} aria-label={t.profileCancelAria} className="w-10 h-10 rounded-xl bg-white/20 border-4 border-[#0A0A0A] flex items-center justify-center shadow-[3px_3px_0_#0A0A0A] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#0A0A0A] transition-all cursor-pointer">
              <X size={20} className="text-white" strokeWidth={3} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white truncate max-w-40" style={{ fontFamily: 'var(--font-heading)' }}>
              {profile?.nickname || '...'}
            </h2>
            <button onClick={() => setEditing(true)} aria-label={t.profileEditAria} className="w-8 h-8 rounded-lg bg-white/10 border-2 border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
              <Pencil size={14} className="text-white/60" strokeWidth={2} />
            </button>
          </div>
        )}
      </div>

      <GlassCard className="flex flex-row items-center justify-between">
        <span className="text-white/60 text-sm font-medium" style={{ fontFamily: 'var(--font-body)' }}>
          {t.profileCoinsLabel}
        </span>
        <span className="flex items-center gap-1.5 text-lg font-bold text-[#C6FF3D]" style={{ fontFamily: 'var(--font-heading)' }}>
          <Coins size={20} className="text-[#C6FF3D]" strokeWidth={2.5} />
          {profile?.coins ?? 0}
        </span>
      </GlassCard>

      <div className="grid grid-cols-3 gap-2">
        {(['body', 'eyes', 'hat'] as const).map((part) => (
          <button
            key={part}
            onClick={() => setPickMode(pickMode === part ? null : part)}
            className={`py-2 rounded-xl border-4 border-[#0A0A0A] text-xs font-bold shadow-[3px_3px_0_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#0A0A0A] transition-all cursor-pointer ${
              pickMode === part ? 'bg-[#FF6B35] text-[#0A0A0A]' : 'bg-white/10 text-white/70'
            }`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {part === 'body' ? 'Body' : part === 'eyes' ? 'Eyes' : 'Hat'}
          </button>
        ))}
      </div>

      {pickMode && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 sm:grid-cols-4 gap-2"
        >
          {(pickMode === 'body' ? FREE_BODIES : pickMode === 'eyes' ? FREE_EYES : FREE_HATS).map((id) => {
            const isActive = avatarConfig[pickMode] === id
            const previewCfg = { ...avatarConfig, [pickMode]: id }
            return (
              <button
                key={id}
                onClick={() => {
                  setAvatarConfig(previewCfg)
                  updateProfileAvatar(previewCfg)
                  setPickMode(null)
                }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-4 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] transition-all cursor-pointer ${
                  isActive ? 'bg-[#C6FF3D]/20 border-[#C6FF3D]' : 'bg-white/5'
                }`}
              >
                <div className="w-12 h-12">
                  <ComposedAvatar {...previewCfg} size={48} />
                </div>
                <span className="text-[9px] text-white/60 text-center leading-tight" style={{ fontFamily: 'var(--font-body)' }}>
                  {pickMode === 'body' ? BODY_NAMES[id as BodyId] : id.replace(/^(hat_|eyes_)/, '').replace('_', ' ')}
                </span>
              </button>
            )
          })}
        </motion.div>
      )}

      <GlassCard>
        <h3 className="text-sm font-bold text-white/80 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          {t.profileInventoryTitle}
        </h3>
        {(!profile?.inventory || profile.inventory.length === 0) ? (
          <p className="text-white/50 text-sm text-center py-4" style={{ fontFamily: 'var(--font-body)' }}>
            {t.comingSoonSubtitle}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.inventory.map((item) => (
              <div key={item.itemId} className="bg-white/5 border-2 border-white/10 rounded-lg px-2.5 py-1 text-xs text-white/70" style={{ fontFamily: 'var(--font-body)' }}>
                {item.itemId}
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
