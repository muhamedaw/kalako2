import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Coins, Loader, X, Lock, Gift, Sparkles } from 'lucide-react'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { useTranslation } from '@/i18n/context'
import { useGameStore } from '@/store/gameStore'
import { useToastStore } from '@/store/toastStore'
import { usePurchaseEmailGateStore } from '@/store/purchaseEmailGateStore'
import { ComposedAvatar } from '@/components/avatarParts'
import { DEFAULT_AVATAR, FREE_EYES, PREMIUM_EYES, FREE_HATS, PREMIUM_HATS } from '@/components/avatarParts/types'
import type { EyesId, HatId } from '@/components/avatarParts/types'
import GlassCard from '@/components/ui/GlassCard'

// Every store item's identity, price, and description come from get_store_catalog — the
// server is the single source of truth. This file must never hardcode an item id: a
// hardcoded id silently drifts out of sync with the real catalog (see the eyes_5/hat_crown
// bug this replaced — those ids never matched what purchase_item actually sells).
function isKnownEyesId(id: string): id is EyesId {
  return (FREE_EYES as string[]).includes(id) || (PREMIUM_EYES as string[]).includes(id)
}
function isKnownHatId(id: string): id is HatId {
  return (FREE_HATS as string[]).includes(id) || (PREMIUM_HATS as string[]).includes(id)
}

// The avatar-rendering system's EyesId/HatId sets predate the server's current avatar_part
// catalog ids (e.g. eyes_premium_05, hat_premium_07) — no visual asset exists for those yet.
// Purchases still work correctly (server tracks ownership regardless), this only affects the
// small preview icon shown while browsing: falls back to a neutral placeholder instead of
// guessing or crashing.
function AvatarPartPreview({ previewId }: { previewId: string }) {
  if (isKnownEyesId(previewId)) {
    return <ComposedAvatar {...DEFAULT_AVATAR} eyes={previewId} size={56} />
  }
  if (isKnownHatId(previewId)) {
    return <ComposedAvatar {...DEFAULT_AVATAR} hat={previewId} size={56} />
  }
  return (
    <div className="w-14 h-14 flex items-center justify-center">
      <Sparkles size={28} className="text-white/40" />
    </div>
  )
}

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
  const requestPurchase = usePurchaseEmailGateStore((s) => s.requestPurchase)
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

  const handleBuy = (itemId: string) => {
    requestPurchase(Boolean(profile?.email), async () => {
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
    })
  }

  const handlePremiumLock = () => {
    showToast(t.premiumUpsellNudge, 'info')
    setTimeout(() => {
      useGameStore.getState().setScreen('premium')
    }, 1500)
  }

  const [giftCode, setGiftCode] = useState('')
  const [friendTag, setFriendTag] = useState('')
  const [giftItemId, setGiftItemId] = useState('')
  const [gifting, setGifting] = useState(false)

  const handleRedeemCode = async () => {
    if (!giftCode.trim()) return
    setGifting(true)
    const res = await useGameStore.getState().redeemGiftCode(giftCode.trim())
    setGifting(false)
    if (res.success) {
      setGiftCode('')
      showToast(t.redeemSuccessMessage, 'success')
    } else {
      showToast(t.redeemInvalidCodeError, 'error')
    }
  }

  const handleGiftItemToTag = async () => {
    if (!friendTag.trim() || !giftItemId.trim()) return
    setGifting(true)
    const res = await useGameStore.getState().giftItemToTag(friendTag.trim(), giftItemId.trim())
    setGifting(false)
    if (res.success) {
      setFriendTag('')
      setGiftItemId('')
      showToast(t.giftSuccessMessage, 'success')
    } else {
      showToast(res.error || t.requestTimeout, 'error')
    }
  }

  const isOwned = (itemId: string) => profile?.inventory?.some((i) => i.itemId === itemId)

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
          onClick={() => !isActive && !processingTier && requestPurchase(Boolean(profile?.email), () => setActiveTier(tier.tierId))}
          onKeyDown={(e) => { if (!isActive && !processingTier && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); requestPurchase(Boolean(profile?.email), () => setActiveTier(tier.tierId)); } }}
          role="button"
          tabIndex={0}
          className={`w-full rounded-xl border-4 border-[#0A0A0A] p-4 flex flex-col items-center gap-2 cursor-pointer transition-all ${
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
            ) : import.meta.env.VITE_PAYPAL_CLIENT_ID ? (
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
            ) : (
              <>
                <div className="text-sm text-white/50 text-center py-4" style={{ fontFamily: 'var(--font-body)' }}>
                  {t.storePaymentUnavailable}
                </div>
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

          {catalog.filter((s) => s.type === 'sound_pack' || s.type === 'frame' || s.type === 'categoryUnlock' || s.type === 'categoryExpansion' || s.type === 'avatar_part').map((section) => (
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
                      {section.type === 'avatar_part' ? (
                        <div className="w-14 h-14">
                          <AvatarPartPreview previewId={item.previewId} />
                        </div>
                      ) : (
                        <div className="text-3xl">
                          {section.type === 'frame' ? '🖼️' : section.type === 'sound_pack' ? '🔊' : section.type === 'categoryUnlock' ? '🔓' : '📦'}
                        </div>
                      )}
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

          <GlassCard key="gift-section">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              <Gift size={18} />
              {t.storeGiftPremiumButton}
            </h2>
            <div className="flex flex-col gap-3 mt-3">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-white/50">{t.redeemCodeLabel}</p>
                <div className="flex gap-2">
                  <input
                    value={giftCode}
                    onChange={(e) => setGiftCode(e.target.value)}
                    placeholder={t.redeemCodeLabel}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-primary/50"
                  />
                  <button
                    onClick={handleRedeemCode}
                    disabled={!giftCode.trim() || gifting}
                    className="px-4 py-2 rounded-lg bg-[#FF6B35] border-2 border-[#0A0A0A] text-xs font-bold text-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer disabled:opacity-50"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {t.redeemCodeButton}
                  </button>
                </div>
              </div>
              <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
                <p className="text-xs font-medium text-white/50">{t.giftToFriendButton}</p>
                <input
                  value={friendTag}
                  onChange={(e) => setFriendTag(e.target.value)}
                  placeholder={t.giftRecipientTagLabel}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-primary/50"
                />
                <select
                  value={giftItemId}
                  onChange={(e) => setGiftItemId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50"
                >
                  <option value="" disabled>{t.giftItemSelectPlaceholder}</option>
                  {catalog.flatMap((section) => section.items).map((item) => (
                    <option key={item.id} value={item.id} className="bg-[#241528]">
                      {item.name} — {item.price} 🪙
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleGiftItemToTag}
                  disabled={!friendTag.trim() || !giftItemId.trim() || gifting}
                  className="w-full py-2 rounded-lg bg-[#FF6B35] border-2 border-[#0A0A0A] text-xs font-bold text-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer disabled:opacity-50"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {t.giftToFriendButton}
                </button>
              </div>
            </div>
          </GlassCard>
        </>
      )}
    </div>
    </PayPalScriptProvider>
  )
}
