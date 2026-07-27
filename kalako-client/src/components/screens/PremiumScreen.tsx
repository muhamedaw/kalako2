import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Star, Crown, ArrowLeft, ArrowRight, Loader } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import PremiumBadge from '@/components/ui/PremiumBadge'
import { useGameStore } from '@/store/gameStore'
import { getDeviceId } from '@/lib/deviceId'
import { getSocket } from '@/lib/socket'
import { useTranslation } from '@/i18n/context'
import { useToastStore } from '@/store/toastStore'
import { usePurchaseEmailGateStore } from '@/store/purchaseEmailGateStore'

const FEATURES = [
  { key: 'premiumFeature1', icon: '🎯' },
  { key: 'premiumFeature2', icon: '👑' },
  { key: 'premiumFeature3', icon: '🏆' },
  { key: 'premiumFeature4', icon: '📊' },
  { key: 'premiumFeature5', icon: '🎨' },
] as const

export default function PremiumScreen() {
  const {
    isPremium,
    premiumExpiresAt,
    setScreen,
    loadPremiumStatus,
    createPremiumSubscription,
    cancelPremiumSubscription,
    profile,
  } = useGameStore()
  const t = useTranslation()
  const BackIcon = t.dir === 'rtl' ? ArrowRight : ArrowLeft
  const showToast = useToastStore((s) => s.show)
  const requestPurchase = usePurchaseEmailGateStore((s) => s.requestPurchase)
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [subscribing, setSubscribing] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [subscribeError, setSubscribeError] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const popupRef = useRef<Window | null>(null)

  useEffect(() => {
    loadPremiumStatus()
    if (!profile) useGameStore.getState().loadProfile()
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (popupRef.current) popupRef.current.close()
    }
  }, [loadPremiumStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  // After opening PayPal popup, poll get_premium_status until activation
  // or the popup closes (handles both user-approval and auto-detect paths).
  const startPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(() => {
      const socket = getSocket()
      socket.emit('get_premium_status', { deviceId: getDeviceId() }, (res: any) => {
        if (res?.isPremium) {
          if (pollRef.current) clearInterval(pollRef.current)
          pollRef.current = null
          useGameStore.setState({ isPremium: true })
          showToast(t.premiumSubscribeSuccess || 'Premium activated!', 'success')
        }
      })
    }, 3000)
    // Stop polling after 2 minutes
    setTimeout(() => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }, 120_000)
  }

  const handleSubscribe = () => {
    requestPurchase(Boolean(profile?.email), async () => {
      setSubscribing(true)
      setSubscribeError(false)
      const res = await createPremiumSubscription(plan)
      setSubscribing(false)
      if (res.error === 'timeout') {
        setSubscribeError(true)
        showToast(t.requestTimeout, 'error')
        return
      }
      if (res.approvalUrl) {
        popupRef.current = window.open(res.approvalUrl, '_blank')
        startPolling()
      }
    })
  }

  const handleCancel = async () => {
    setCancelling(true)
    cancelPremiumSubscription()
    setCancelling(false)
  }

  return (
    <div className="flex flex-col min-h-dvh px-4 py-6 gap-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <button
          onClick={() => setScreen('welcome')}
          className="flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <BackIcon size={16} />
          {t.back}
        </button>
      </motion.div>

      <div className="flex flex-col items-center gap-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C6FF3D] to-[#FF6B35] flex items-center justify-center shadow-lg">
            <Crown size={32} color="#0A0A0A" strokeWidth={2} />
          </div>
          <h1
            className="text-2xl font-black text-white text-center"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {t.premiumScreenTitle}
          </h1>
          {t.premiumTagline && (
            <p className="text-sm text-white/50 text-center max-w-xs">
              {t.premiumTagline}
            </p>
          )}
        </motion.div>

        {isPremium ? (
          <div className="w-full max-w-sm flex flex-col gap-4">
            <GlassCard strong className="w-full">
              <div className="flex flex-col items-center gap-3 py-2">
                <PremiumBadge size={28} />
                <p
                  className="text-lg font-bold text-[#C6FF3D] text-center"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {t.premiumCurrentPlanLabel}
                </p>
                {premiumExpiresAt && (
                  <p className="text-sm text-white/50 text-center">
                    {t.premiumExpiresLabel.replace('{{date}}', new Date(premiumExpiresAt).toLocaleDateString())}
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? <Loader size={14} className="animate-spin" /> : t.premiumCancelButton}
                </Button>
              </div>
            </GlassCard>

            <GlassCard className="w-full">
              <p className="text-sm font-bold text-white/70 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                {t.premiumCurrentPlanLabel}
              </p>
              <div className="flex flex-col gap-3">
                {FEATURES.map((f) => (
                  <div key={f.key} className="flex items-start gap-2.5">
                    <span className="text-lg flex-shrink-0">{f.icon}</span>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {(t as any)[f.key]}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        ) : (
          <div className="w-full max-w-sm flex flex-col gap-4">
            <GlassCard className="w-full">
              <div className="flex flex-col gap-3">
                {FEATURES.map((f) => (
                  <div key={f.key} className="flex items-start gap-2.5">
                    <span className="text-lg flex-shrink-0">{f.icon}</span>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {(t as any)[f.key]}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard strong className="w-full">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPlan('monthly')}
                    className={`py-3 rounded-xl text-sm font-bold transition-all cursor-pointer relative ${
                      plan === 'monthly'
                        ? 'bg-[#FF6B35] text-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A]'
                        : 'bg-white/10 text-white/70 hover:text-white border border-white/10'
                    }`}
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    <div>{t.premiumMonthlyLabel}</div>
                    <div className="text-[10px] opacity-70">{t.premiumMonthlyPrice}</div>
                  </button>
                  <button
                    onClick={() => setPlan('yearly')}
                    className={`py-3 rounded-xl text-sm font-bold transition-all cursor-pointer relative ${
                      plan === 'yearly'
                        ? 'bg-[#FF6B35] text-[#0A0A0A] shadow-[2px_2px_0_#0A0A0A]'
                        : 'bg-white/10 text-white/70 hover:text-white border border-white/10'
                    }`}
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    <div>{t.premiumYearlyLabel}</div>
                    <div className="text-[10px] opacity-70">{t.premiumYearlyPrice}</div>
                    {plan === 'yearly' && (
                      <span className="absolute -top-2 -end-2 text-[9px] font-bold bg-[#C6FF3D] text-[#0A0A0A] px-1.5 py-0.5 rounded-full">
                        {t.premiumYearlySavings}
                      </span>
                    )}
                  </button>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleSubscribe}
                  disabled={subscribing}
                >
                  {subscribing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader size={16} className="animate-spin" />
                      {t.storePaymentProcessing}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Star size={16} fill="#0A0A0A" color="#0A0A0A" />
                      {t.premiumSubscribeButton}
                    </span>
                  )}
                </Button>
                {subscribeError && (
                  <p className="text-xs text-center text-white/50">
                    {t.requestRetry}
                  </p>
                )}

                {t.premiumNotAvailable && (
                  <p className="text-[11px] text-white/30 text-center leading-relaxed">
                    {t.premiumNotAvailable}
                  </p>
                )}
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  )
}
