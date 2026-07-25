import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Coins } from 'lucide-react'
import { useTranslation } from '@/i18n/context'
import { useGameStore } from '@/store/gameStore'
import { useToastStore } from '@/store/toastStore'
import { AVATARS } from '@/types'
import GlassCard from '@/components/ui/GlassCard'

const AVATAR_EMOJI_MAP: Record<string, string> = {
  avatar_17: AVATARS[4] || '🦊',
  avatar_18: AVATARS[5] || '🐱',
  avatar_19: AVATARS[6] || '🐶',
  avatar_20: AVATARS[7] || '🦁',
  avatar_21: AVATARS[8] || '🐸',
  avatar_22: AVATARS[9] || '🐙',
}

export default function StoreScreen() {
  const t = useTranslation()
  const { catalog, catalogLoading, loadCatalog, buyItem, profile } = useGameStore()
  const showToast = useToastStore((s) => s.show)

  useEffect(() => {
    loadCatalog()
  }, [loadCatalog])

  useEffect(() => {
    if (!profile) {
      useGameStore.getState().loadProfile()
    }
  }, [profile])

  const handleBuy = (itemId: string) => {
    buyItem(itemId)
    showToast(t.storePurchaseSuccess, 'success')
  }

  const isOwned = (itemId: string) => profile?.inventory?.some((i) => i.itemId === itemId)

  const ITEM_LABELS: Record<string, { name: string; desc: string }> = {
    avatar_17: { name: t.storeItemAvatar17Name, desc: '' },
    avatar_18: { name: t.storeItemAvatar18Name, desc: '' },
    avatar_19: { name: t.storeItemAvatar19Name, desc: '' },
    avatar_20: { name: t.storeItemAvatar20Name, desc: '' },
    avatar_21: { name: t.storeItemAvatar21Name, desc: '' },
    avatar_22: { name: t.storeItemAvatar22Name, desc: '' },
    sfx_pack_arcade: { name: t.storeItemSfxArcadeName, desc: t.storeItemSfxArcadeDesc },
    sfx_pack_retro: { name: t.storeItemSfxRetroName, desc: t.storeItemSfxRetroDesc },
    sfx_pack_soft: { name: t.storeItemSfxSoftName, desc: t.storeItemSfxSoftDesc },
    frame_gold: { name: t.storeItemFrameGoldName, desc: t.storeItemFrameGoldDesc },
    frame_neon: { name: t.storeItemFrameNeonName, desc: t.storeItemFrameNeonDesc },
    frame_fire: { name: t.storeItemFrameFireName, desc: t.storeItemFrameFireDesc },
    frame_royal: { name: t.storeItemFrameRoyalName, desc: t.storeItemFrameRoyalDesc },
  }

  const SECTION_DESCS: Record<string, string> = {
    avatar: t.storeSectionAvatarsDesc,
    sound_pack: t.storeSectionEffectsDesc,
    frame: t.storeSectionFramesDesc,
  }

  return (
    <div className="flex flex-col min-h-dvh px-4 gap-4 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1
          className="text-2xl font-black text-gradient"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {t.navStore}
        </h1>
        <div className="flex items-center gap-1.5 bg-white/10 border-2 border-[#0A0A0A] rounded-xl px-3 py-1.5">
          <Coins size={16} className="text-primary" strokeWidth={2.5} />
          <span className="text-sm font-bold text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
            {profile?.coins ?? 0}
          </span>
        </div>
      </motion.div>

      {catalogLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        catalog.map((section) => (
          <motion.div
            key={section.type}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="mb-4">
              <h2
                className="text-lg font-bold text-white mb-1"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {section.title}
              </h2>
              <p className="text-white/50 text-xs mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                {SECTION_DESCS[section.type] || section.description}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {section.items.map((item) => {
                  const owned = isOwned(item.id)
                  const labels = ITEM_LABELS[item.id] || { name: item.id, desc: item.description }
                  return (
                    <motion.div
                      key={item.id}
                      whileTap={{ scale: 0.97 }}
                      className={`rounded-xl border-4 border-[#0A0A0A] p-3 flex flex-col items-center gap-2 ${
                        owned ? 'bg-green-500/20' : 'bg-white/5'
                      }`}
                    >
                      <div className="text-3xl">
                        {section.type === 'avatar'
                          ? AVATAR_EMOJI_MAP[item.id] || '👤'
                          : section.type === 'frame'
                          ? '🖼️'
                          : '🔊'}
                      </div>
                      <span
                        className="text-xs font-bold text-white text-center leading-tight"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {labels.name}
                      </span>
                      {labels.desc && (
                        <span className="text-[10px] text-white/40 text-center leading-tight" style={{ fontFamily: 'var(--font-body)' }}>
                          {labels.desc}
                        </span>
                      )}
                      {owned ? (
                        <span className="text-[11px] font-bold text-green-400" style={{ fontFamily: 'var(--font-heading)' }}>
                          {t.storeOwnedLabel}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleBuy(item.id)}
                          className="w-full py-1.5 rounded-lg bg-primary border-2 border-[#0A0A0A] text-[11px] font-bold text-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          <span className="flex items-center justify-center gap-1">
                            <Coins size={12} strokeWidth={2.5} />
                            {item.price}
                          </span>
                        </button>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </GlassCard>
          </motion.div>
        ))
      )}
    </div>
  )
}
