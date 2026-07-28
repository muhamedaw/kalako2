import { motion } from 'framer-motion'
import { Crown, Lock } from 'lucide-react'
import ComposedAvatar from './ComposedAvatar'
import type { AvatarConfig } from './types'
import type { Translations } from '@/i18n/types'
import { getAvatarPartName } from '@/lib/avatarUtils'

interface Props {
  items: readonly string[]
  pickMode: 'body' | 'eyes' | 'hat'
  avatarConfig: AvatarConfig
  isPremiumPart: (id: string) => boolean
  owned: (id: string) => boolean
  isPremium: boolean
  onSelect: (id: string) => void
  onLocked: () => void
  t: Translations
}

export default function AvatarPartGrid({
  items,
  pickMode,
  avatarConfig,
  isPremiumPart,
  owned,
  isPremium,
  onSelect,
  onLocked,
  t,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-3 sm:grid-cols-4 gap-2"
    >
      {items.map((id) => {
        const isActive = avatarConfig[pickMode] === id
        const previewCfg = { ...avatarConfig, [pickMode]: id }
        const locked = isPremiumPart(id) && !owned(id) && !isPremium

        return (
          <button
            key={id}
            onClick={() => {
              if (locked) {
                onLocked()
                return
              }
              onSelect(id)
            }}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl border-4 border-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] transition-all cursor-pointer relative ${
              isActive ? 'bg-[#C6FF3D]/20 border-[#C6FF3D]' : locked ? 'bg-white/5 opacity-60' : 'bg-white/5'
            }`}
          >
            {locked && (
              <div className="absolute -top-1.5 -end-1.5 z-10 w-5 h-5 rounded-full bg-[#FF6B35] border-2 border-[#0A0A0A] flex items-center justify-center shadow-sm">
                <Crown size={10} className="text-[#0A0A0A]" strokeWidth={2.5} />
              </div>
            )}
            <div className="w-12 h-12">
              <ComposedAvatar {...previewCfg} size={48} />
            </div>
            <span className="text-[9px] text-white/60 text-center leading-tight flex items-center gap-1" style={{ fontFamily: 'var(--font-body)' }}>
              {locked && <Lock size={8} className="text-[#FF6B35]" strokeWidth={2.5} />}
              {getAvatarPartName(id, t)}
            </span>
          </button>
        )
      })}
    </motion.div>
  )
}
