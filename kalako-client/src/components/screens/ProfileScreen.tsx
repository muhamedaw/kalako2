import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Pencil, Check, X, Coins } from 'lucide-react'
import { useTranslation } from '@/i18n/context'
import { useGameStore } from '@/store/gameStore'
import { useToastStore } from '@/store/toastStore'
import { ComposedAvatar } from '@/components/avatarParts'
import AvatarPartGrid from '@/components/avatarParts/AvatarPartGrid'
import { DEFAULT_AVATAR, FREE_BODIES, FREE_EYES, FREE_HATS, PREMIUM_EYES, PREMIUM_HATS } from '@/components/avatarParts/types'
import type { AvatarConfig } from '@/components/avatarParts/types'
import { parseAvatarConfig } from '@/lib/avatarUtils'
import GlassCard from '@/components/ui/GlassCard'
import { getCategoryLabel, getCategoryEmoji } from '@/types'

const ALL_EYES = [...FREE_EYES, ...PREMIUM_EYES]
const ALL_HATS = [...FREE_HATS, ...PREMIUM_HATS]

export default function ProfileScreen() {
  const t = useTranslation()
  const { profile, loadProfile, updateProfileNickname, updateProfileAvatar, isPremium, setScreen, categoryCompletion, getCategoryCompletion } = useGameStore()
  const showToast = useToastStore((s) => s.show)
  const [editing, setEditing] = useState(false)
  const [nickname, setNickname] = useState('')
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR)
  const [pickMode, setPickMode] = useState<'body' | 'eyes' | 'hat' | null>(null)

  useEffect(() => {
    loadProfile()
    getCategoryCompletion()
  }, [loadProfile, getCategoryCompletion])

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

      {profile?.playerTag && (
        <GlassCard className="flex flex-row items-center justify-between">
          <span className="text-white/60 text-sm font-medium" style={{ fontFamily: 'var(--font-body)' }}>
            {t.profilePlayerTagLabel}
          </span>
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono font-bold text-primary select-all">{profile.playerTag}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(profile.playerTag!)
                showToast(t.profileCopyTagButton, 'success')
              }}
              className="text-[10px] font-bold text-white/50 hover:text-white cursor-pointer"
              aria-label={t.profileCopyTagButton}
            >
              {t.profileCopyTagButton}
            </button>
          </div>
        </GlassCard>
      )}

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
            {part === 'body' ? t.profileTabBody : part === 'eyes' ? t.profileTabEyes : t.profileTabHat}
          </button>
        ))}
      </div>

      {pickMode && (
        <AvatarPartGrid
          items={pickMode === 'body' ? FREE_BODIES : pickMode === 'eyes' ? ALL_EYES : ALL_HATS}
          pickMode={pickMode}
          avatarConfig={avatarConfig}
          isPremiumPart={(id) =>
            pickMode === 'eyes'
              ? (PREMIUM_EYES as readonly string[]).includes(id)
              : pickMode === 'hat'
                ? (PREMIUM_HATS as readonly string[]).includes(id)
                : false
          }
          owned={(id) => !!profile?.inventory?.find((i) => i.itemId === id)}
          isPremium={isPremium}
          onSelect={(id) => {
            const previewCfg = { ...avatarConfig, [pickMode]: id }
            setAvatarConfig(previewCfg)
            updateProfileAvatar(previewCfg)
            setPickMode(null)
          }}
          onLocked={() => {
            showToast(t.premiumUpsellNudge, 'info')
            setTimeout(() => setScreen('premium'), 1200)
          }}
          t={t}
        />
      )}

      <GlassCard>
        <h3 className="text-sm font-bold text-white/80 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          {t.profileInventoryTitle}
        </h3>
        {(!profile?.inventory || profile.inventory.length === 0) ? (
          <p className="text-white/50 text-sm text-center py-4" style={{ fontFamily: 'var(--font-body)' }}>
            {t.profileInventoryEmpty}
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

      {categoryCompletion.length > 0 && (
        <GlassCard>
          <h3 className="text-sm font-bold text-white/80 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
            {t.categoryCompletionTitle}
          </h3>
          <div className="flex flex-col gap-2.5">
            {categoryCompletion.map((c) => (
              <div key={c.category} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70 font-medium">
                    {getCategoryEmoji(c.category)} {getCategoryLabel(c.category, t.lang)}
                  </span>
                  <span className="text-white/40">
                    {c.percentage}% · {t.categoryCompletionSeen.replace('{{seen}}', String(c.seenCount)).replace('{{total}}', String(c.totalCount))}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-[#C6FF3D] rounded-full transition-all" style={{ width: `${c.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  )
}
