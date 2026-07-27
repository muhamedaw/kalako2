import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LogoSquare from '@/components/brand/LogoSquare'
import { useGameStore } from '@/store/gameStore'
import { useTranslation } from '@/i18n/context'
import { useToastStore } from '@/store/toastStore'

interface Props {
  onDone: () => void
}

export default function RecoverAccountScreen({ onDone }: Props) {
  const { requestAccountRecovery, confirmAccountRecovery, setScreen } = useGameStore()
  const t = useTranslation()
  const BackIcon = t.dir === 'rtl' ? ArrowRight : ArrowLeft
  const showToast = useToastStore((s) => s.show)

  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const handleSendCode = async () => {
    if (!email.trim()) return
    setSending(true)
    const res = await requestAccountRecovery(email.trim())
    setSending(false)
    // Server always acks {success:true} regardless of match (anti-enumeration) — the UI
    // always advances to the code step and shows the same neutral notice either way.
    // Only a genuine network error (disconnected socket, request timeout) returns
    // {success:false} — surface that so the user knows to retry.
    if (res.success) {
      setStep('code')
      showToast(t.authRecoverCodeSentNotice, 'info')
    } else {
      showToast(t.authRecoverSendError, 'error')
    }
  }

  const handleVerify = async () => {
    if (!code.trim()) return
    setVerifying(true)
    const res = await confirmAccountRecovery(email.trim(), code.trim())
    setVerifying(false)
    if (res.success) {
      showToast(t.authRecoverSuccess, 'success')
      onDone()
    } else {
      showToast(t.authRecoverInvalidCode, 'error')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 py-8 gap-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="w-20 h-20">
          <LogoSquare />
        </div>
        <h1
          className="text-2xl font-black text-center"
          style={{
            fontFamily: 'var(--font-heading)',
            color: '#FF6B35',
            textShadow: '0 0 24px rgba(255,107,53,0.5), 4px 4px 0 rgba(10,10,10,0.85)',
          }}
        >
          {t.authRecoverTitle}
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <GlassCard className="flex flex-col gap-4">
          {step === 'email' ? (
            <>
              <Input
                label={t.authRecoverEmailLabel}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.authRecoverEmailPlaceholder}
                autoComplete="email"
              />
              <Button
                variant="primary"
                size="md"
                fullWidth
                disabled={!email.trim() || sending}
                onClick={handleSendCode}
                style={{ borderWidth: '3px', boxShadow: '4px 4px 0 #0A0A0A' }}
              >
                {sending ? '…' : t.authRecoverSendCodeButton}
              </Button>
            </>
          ) : (
            <>
              <p className="text-xs text-white/50 text-center -mt-1">{t.authRecoverCodeSentNotice}</p>
              <Input
                label={t.authRecoverCodeLabel}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder={t.authRecoverCodePlaceholder}
              />
              <Button
                variant="primary"
                size="md"
                fullWidth
                disabled={code.trim().length !== 6 || verifying}
                onClick={handleVerify}
                style={{ borderWidth: '3px', boxShadow: '4px 4px 0 #0A0A0A' }}
              >
                {verifying ? '…' : t.authRecoverVerifyButton}
              </Button>
            </>
          )}
        </GlassCard>
      </motion.div>

      <button
        onClick={() => setScreen('auth')}
        className="flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors cursor-pointer"
      >
        <BackIcon size={16} />
        {t.authRecoverBackButton}
      </button>
    </div>
  )
}
