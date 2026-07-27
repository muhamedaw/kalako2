import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Coins, Loader, X, Lock } from 'lucide-react'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { useTranslation } from '@/i18n/context'
import { useGameStore } from '@/store/gameStore'
import { useToastStore } from '@/store/toastStore'
import { ComposedAvatar } from '@/components/avatarParts'
import { DEFAULT_AVATAR } from '@/components/avatarParts/types'
import type { AvatarConfig } from '@/components/avatarParts/types'
import type { Translations } from '@/i18n/types'
import GlassCard from '@/components/ui/GlassCard'

function getStoreItemName(id: string, t: Translations): string {
  const map: Record<string, keyof Translations> = {
    eyes_5: 'storeItemEyesHeart',
    eyes_6: 'storeItemEyesStar',
    eyes_7: 'storeItemEyesFire',
    eyes_8: 'storeItemEyesSpiral',
    premium_eyes_1: 'storeItemEyesGalaxy',
    hat_crown: 'storeItemHatCrown',
    hat_tophat: 'storeItemHatTophat',
    hat_wizard: 'storeItemHatWizard',
    hat_propeller: 'storeItemHatPropeller',
    hat_sombrero: 'storeItemHatSombrero',
    hat_viking: 'storeItemHatViking',
    premium_hat_1: 'storeItemHatHalo',
    premium_frame_1: 'storeItemFrameDiamond',
  }
  const key = map[id]
  return key ? (t[key] as string) || id : id
}

interface SectionItem {
  id: string
  type: 'eyes' | 'hat'
  name: string
  price: number
  previewEyes?: string
  previewHat?: string
}

const EYES_ITEMS: SectionItem[] = [
  { id: 'eyes_5', type: 'eyes', name: 'Heart Eyes', price: 150, previewEyes: 'eyes_5' },
  { id: 'eyes_6', type: 'eyes', name: 'Star Eyes', price: 150, previewEyes: 'eyes_6' },
  { id: 'eyes_7', type: 'eyes', name: 'Fire Eyes', price: 200, previewEyes: 'eyes_7' },
  { id: 'eyes_8', type: 'eyes', name: 'Spiral Eyes', price: 200, previewEyes: 'eyes_8' },
  { id: 'premium_eyes_1', type: 'eyes', name: 'Galaxy Eyes', price: 0, previewEyes: 'eyes_5' },
]

const HATS_ITEMS: SectionItem[] = [
  { id: 'hat_crown', type: 'hat', name: 'Crown', price: 250, previewHat: 'hat_crown' },
  { id: 'hat_tophat', type: 'hat', name: 'Top Hat', price: 200, previewHat: 'hat_tophat' },
  { id: 'hat_wizard', type: 'hat', name: 'Wizard Hat', price: 250, previewHat: 'hat_wizard' },
  { id: 'hat_propeller', type: 'hat', name: 'Propeller Beanie', price: 150, previewHat: 'hat_propeller' },
  { id: 'hat_sombrero', type: 'hat', name: 'Sombrero', price: 300, previewHat: 'hat_sombrero' },
  { id: 'hat_viking', type: 'hat', name: 'Viking Helmet', price: 350, previewHat: 'hat_viking' },
  { id: 'premium_hat_1', type: 'hat', name: 'Halo', price: 0, previewHat: 'hat_crown' },
  { id: 'premium_frame_1', type: 'hat', name: 'Diamond Frame', price: 0, previewHat: 'hat_crown' },
]

interface CoinTier {
  tierId: string
  coins: number
  bonus: number
  usdCents: number
}

const COIN_TIERS: CoinTier[] = [
  { tierId: 'small', coins: 100, bonus: 0, usdCents: 99 },
  { tierId: 'medium', coins: 350, bonus: 50, usdCents: 299 },
  { tierId: 'large', coins: 800, bonus: 200, usdCents: 599 },
]

export default function StoreScreen() {
  const t = useTranslation()
  const { catalog, catalogLoading, loadCatalog, buyItem, profile, createPayPalOrder, capturePayPalOrder } = useGameStore()
  const showToast = useToastStore((s) => s.show)
  const [activeTier, setActiveTier] = useState<string | null>(null)
  const [processingTier, setProcessingTier] = useState<string | null>(null)

  useEffect(() => {
    loadCatalog()
  }, [loadCatalog])

  useEffect(() => {
    if (!profile) {
      useGameStore.getState().loadProfile()
    }
  }, [profile])

  const handleBuy = async (itemId: string) => {
    const res = await buyItem(itemId)
    if (res.success) {
      showToast(t.storePurchaseSuccess, 'success')
    } else if (res.error === 'insufficient_funds') {
      showToast(t.storeInsufficientFunds, 'error')
    } else if (res.error === 'timeout') {
      showToast(t.requestTimeout, 'error')
    }
    // Other error codes (already_owned, invalid_item, rate_limited) are edge cases the UI
    // shouldn't normally allow a click into — fail silently rather than invent new copy.
  }

  const handlePremiumLock = () => {
    showToast(t.premiumUpsellNudge, 'info')
    setTimeout(() => {
      useGameStore.getState().setScreen('premium')
    }, 1500)
  }

  const isOwned = (itemId: string) => profile?.inventory?.some((i) => i.itemId === itemId)

  function renderItemCard(item: SectionItem) {
    const owned = isOwned(item.id)
    const locked = item.id.startsWith('premium_')
    const previewCfg: AvatarConfig = {
      body: DEFAULT_AVATAR.body,
      eyes: (item.previewEyes || DEFAULT_AVATAR.eyes) as any,
      hat: (item.previewHat || DEFAULT_AVATAR.hat) as any,
    }
    return (
      <motion.div
        key={item.id}
        whileTap={{ scale: 0.97 }}
        className={`rounded-xl border-4 border-[#0A0A0A] p-3 flex flex-col items-center gap-2 ${owned ? 'bg-[#C6FF3D]/15' : 'bg-white/5'}`}
      >
        <div className="w-14 h-14">
          <ComposedAvatar {...previewCfg} size={56} />
        </div>
        <span className="text-xs font-bold text-white text-center leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          {getStoreItemName(item.id, t)}
        </span>
        {owned ? (
          <span className="text-[11px] font-bold text-[#C6FF3D]" style={{ fontFamily: 'var(--font-heading)' }}>
            {t.storeOwnedLabel}
          </span>
        ) : locked ? (
          <button
            onClick={handlePremiumLock}
            className="w-full py-1.5 rounded-lg bg-white/5 border-2 border-[#C6FF3D]/30 text-[11px] font-bold text-[#C6FF3D]/70 hover:bg-[#C6FF3D]/10 transition-all cursor-pointer flex items-center justify-center gap-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <Lock size={10} />
            {t.premiumLockedBadge}
          </button>
        ) : (
          <button
            onClick={() => handleBuy(item.id)}
            className="w-full py-1.5 rounded-lg bg-[#FF6B35] border-2 border-[#0A0A0A] text-[11px] font-bold text-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
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
  }

  const handleCreateOrder = useCallback(async (tierId: string) => {
    setProcessingTier(tierId)
    const res = await createPayPalOrder(tierId)
    setProcessingTier(null)
    if (res.error) {
      showToast(res.error === 'timeout' ? t.requestTimeout : t.storePaymentCancelled, 'error')
      return ''
    }
    return res.orderId || ''
  }, [createPayPalOrder, showToast, t])

  const handleApprove = useCallback((tierId: string, paypalOrderId: string) => {
    capturePayPalOrder(paypalOrderId, tierId)
    const tier = COIN_TIERS.find((ct) => ct.tierId === tierId)
    const totalCoins = tier ? tier.coins + tier.bonus : 0
    showToast(t.storeCoinsPurchaseSuccess.replace('{{coins}}', String(totalCoins)), 'success')
    setActiveTier(null)
  }, [capturePayPalOrder, showToast, t])

  const handleCancel = useCallback(() => {
    showToast(t.storePaymentCancelled)
    setActiveTier(null)
  }, [showToast, t])

  function renderTierCard(tier: CoinTier) {
    const isActive = activeTier === tier.tierId
    const isProcessing = processingTier === tier.tierId
    const totalCoins = tier.coins + tier.bonus
    const priceStr = `$${(tier.usdCents / 100).toFixed(2)}`
    const tierLabel = tier.tierId === 'small' ? t.storeTierSmallLabel : tier.tierId === 'medium' ? t.storeTierMediumLabel : t.storeTierLargeLabel

    return (
      <div key={tier.tierId}>
        <motion.div
          whileTap={!isActive ? { scale: 0.97 } : undefined}
          onClick={() => !isActive && !processingTier && setActiveTier(tier.tierId)}
          onKeyDown={(e) => { if (!isActive && !processingTier && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setActiveTier(tier.tierId); } }}
          role="button"
          tabIndex={0}
          className={`rounded-xl border-4 border-[#0A0A0A] p-4 flex flex-col items-center gap-2 cursor-pointer transition-all ${
            isActive ? 'bg-[#FF6B35]/15 border-[#FF6B35]' : 'bg-white/5 hover:bg-white/10'
          }`}
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          <Coins size={36} color="#C6FF3D" strokeWidth={2} />
          <span className="text-xl font-black text-white">{tierLabel}</span>
          <span className="text-2xl font-black text-[#C6FF3D]">{t.storeTierAmount.replace('{{coins}}', String(totalCoins))}</span>
          {tier.bonus > 0 && (
            <span className="text-xs font-bold text-[#FF6B35] bg-[#FF6B35]/15 px-2 py-0.5 rounded-full">
              {tier.tierId === 'medium'
                ? t.storeTierMediumBonus.replace('{{bonus}}', String(tier.bonus))
                : t.storeTierLargeBonus.replace('{{bonus}}', String(tier.bonus))}
            </span>
          )}
          <span className="text-lg font-bold text-[#FF6B35]">{priceStr}</span>
        </motion.div>

        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader size={20} className="animate-spin text-[#C6FF3D]" />
                <span className="text-sm text-white/70" style={{ fontFamily: 'var(--font-body)' }}>
                  {t.storePaymentProcessing}
                </span>
              </div>
            ) : (
              <>
                <PayPalButtons
                  style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
                  createOrder={() => handleCreateOrder(tier.tierId)}
                  onApprove={async (data) => handleApprove(tier.tierId, data.orderID)}
                  onCancel={() => handleCancel()}
                  onError={() => {
                    showToast(t.storePaymentCancelled)
                    setActiveTier(null)
                  }}
                />
                <button
                  onClick={() => setActiveTier(null)}
                  className="w-full mt-2 py-2 rounded-lg bg-white/5 border-2 border-white/10 text-xs font-bold text-white/50 hover:text-white/80 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  <X size={14} strokeWidth={2.5} />
                  {t.storeCancelButton}
                </button>
              </>
            )}
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || '', currency: 'USD', intent: 'capture' }}>
    <div className="flex flex-col min-h-dvh px-4 gap-4 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1
          className="text-2xl font-black"
          style={{ fontFamily: 'var(--font-heading)', color: '#FF6B35' }}
        >
          {t.navStore}
        </h1>
        <div className="flex items-center gap-1.5 bg-white/10 border-2 border-[#0A0A0A] rounded-xl px-3 py-1.5">
          <Coins size={16} color="#C6FF3D" strokeWidth={2.5} />
          <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-heading)', color: '#C6FF3D' }}>
            {profile?.coins ?? 0}
          </span>
        </div>
      </motion.div>

      {catalogLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#FF6B35]/30 border-t-[#FF6B35] rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <GlassCard key="buy-coins">
            <h2 className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              {t.storeBuyCoinsTitle}
            </h2>
            <p className="text-white/50 text-xs mb-4" style={{ fontFamily: 'var(--font-body)' }}>
              {t.storeBuyCoinsDesc}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {COIN_TIERS.map(renderTierCard)}
            </div>
          </GlassCard>

          <GlassCard key="eyes-section">
            <h2 className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              {t.storePremiumEyesTitle}
            </h2>
            <p className="text-white/50 text-xs mb-4" style={{ fontFamily: 'var(--font-body)' }}>
              {t.storePremiumEyesDesc}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {EYES_ITEMS.map(renderItemCard)}
            </div>
          </GlassCard>

          <GlassCard key="hats-section">
            <h2 className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              {t.storePremiumHatsTitle}
            </h2>
            <p className="text-white/50 text-xs mb-4" style={{ fontFamily: 'var(--font-body)' }}>
              {t.storePremiumHatsDesc}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {HATS_ITEMS.map(renderItemCard)}
            </div>
          </GlassCard>

          {catalog.filter((s) => s.type === 'sound_pack' || s.type === 'frame' || s.type === 'categoryUnlock' || s.type === 'categoryExpansion').map((section) => (
            <GlassCard key={section.type}>
              <h2 className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                {section.title}
              </h2>
              <p className="text-white/50 text-xs mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                {section.description}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {section.items.map((item) => {
                  const owned = isOwned(item.id)
                  const locked = item.premium && !owned
                  return (
                    <motion.div
                      key={item.id}
                      whileTap={{ scale: 0.97 }}
                      className={`rounded-xl border-4 border-[#0A0A0A] p-3 flex flex-col items-center gap-2 ${owned ? 'bg-[#C6FF3D]/15' : 'bg-white/5'}`}
                    >
                      <div className="text-3xl">
                        {section.type === 'frame' ? '🖼️' : section.type === 'sound_pack' ? '🔊' : section.type === 'categoryUnlock' ? '🔓' : '📦'}
                      </div>
                      <span className="text-xs font-bold text-white text-center leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                        {item.name}
                      </span>
                      {owned ? (
                        <span className="text-[11px] font-bold text-[#C6FF3D]" style={{ fontFamily: 'var(--font-heading)' }}>
                          {t.storeOwnedLabel}
                        </span>
                      ) : locked ? (
                        <button
                          onClick={handlePremiumLock}
                          className="w-full py-1.5 rounded-lg bg-white/5 border-2 border-[#C6FF3D]/30 text-[11px] font-bold text-[#C6FF3D]/70 hover:bg-[#C6FF3D]/10 transition-all cursor-pointer flex items-center justify-center gap-1"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          <Lock size={10} />
                          {t.premiumLockedBadge}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuy(item.id)}
            className="w-full py-1.5 rounded-lg bg-[#FF6B35] border-2 border-[#0A0A0A] text-[11px] font-bold text-[#241528] shadow-[2px_2px_0_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
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
          ))}
        </>
      )}
    </div>
    </PayPalScriptProvider>
  )
}
