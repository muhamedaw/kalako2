import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import ArcadeModal from '@/components/ui/ArcadeModal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { usePurchaseEmailGateStore } from '@/store/purchaseEmailGateStore'
import { useGameStore } from '@/store/gameStore'
import { useTranslation } from '@/i18n/context'

export default function PurchaseEmailGate() {
  const { isOpen, skip, markLinked, close } = usePurchaseEmailGateStore()
  const { linkRecoveryEmail, confirmLinkRecoveryEmail } = useGameStore()
  const t = useTranslation()

  const [step, setStep] = useState<'nudge' | 'email' | 'code'>('nudge')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setStep('nudge')
    setEmail('')
    setCode('')
    setError(null)
  }

  const handleClose = () => {
    reset()
    close()
  }

  const handleSendCode = async () => {
    setSending(true)
    setError(null)
    const res = await linkRecoveryEmail(email.trim())
    setSending(false)
    if (res.success) {
      setStep('code')
    } else if (res.error === 'email_not_configured') {
      // No SMTP configured server-side — don't block the purchase over an infra gap.
      setError(t.purchaseEmailNotConfigured)
      setTimeout(() => { reset(); skip() }, 1800)
    } else if (res.error === 'rate_limited') {
      setError(t.purchaseEmailRateLimited)
    } else {
      setError(t.authRecoverSendError)
    }
  }

  const handleVerify = async () => {
    setSending(true)
    setError(null)
    const res = await confirmLinkRecoveryEmail(email.trim(), code.trim())
    setSending(false)
    if (res.success) {
      reset()
      markLinked()
    } else {
      setError(t.purchaseEmailInvalidCode)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <ArcadeModal onClose={handleClose}>
          <div className="flex flex-col gap-4 text-black">
            {step === 'nudge' && (
              <>
                <h2 className="text-xl font-black text-center" style={{ fontFamily: 'var(--font-heading)' }}>
                  {t.purchaseEmailNudgeTitle}
                </h2>
                <p className="text-sm leading-relaxed text-center">{t.purchaseEmailNudgeBody}</p>
                <div className="flex flex-col gap-2 mt-2">
                  <Button variant="secondary" size="lg" fullWidth onClick={() => setStep('email')}>
                    {t.purchaseAddEmailButton}
                  </Button>
                  <Button variant="primary" size="lg" fullWidth onClick={skip}>
                    {t.purchaseSkipButton}
                  </Button>
                </div>
              </>
            )}

            {step === 'email' && (
              <>
                <h2 className="text-xl font-black text-center" style={{ fontFamily: 'var(--font-heading)' }}>
                  {t.purchaseAddEmailButton}
                </h2>
                <Input
                  label={t.authRecoverEmailLabel}
                  placeholder={t.authRecoverEmailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                />
                {error && <p className="text-sm text-red-700 text-center">{error}</p>}
                <div className="flex flex-col gap-2 mt-2">
                  <Button variant="secondary" size="lg" fullWidth disabled={!email.trim() || sending} onClick={handleSendCode}>
                    {sending ? '…' : t.authRecoverSendCodeButton}
                  </Button>
                  <Button variant="primary" size="lg" fullWidth onClick={skip}>
                    {t.purchaseSkipButton}
                  </Button>
                </div>
              </>
            )}

            {step === 'code' && (
              <>
                <h2 className="text-xl font-black text-center" style={{ fontFamily: 'var(--font-heading)' }}>
                  {t.purchaseAddEmailButton}
                </h2>
                <p className="text-sm leading-relaxed text-center">{t.purchaseEmailSentNotice}</p>
                <Input
                  label={t.authRecoverCodeLabel}
                  placeholder={t.authRecoverCodePlaceholder}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  dir="ltr"
                  className="text-center tracking-widest"
                />
                {error && <p className="text-sm text-red-700 text-center">{error}</p>}
                <div className="flex flex-col gap-2 mt-2">
                  <Button variant="secondary" size="lg" fullWidth disabled={code.trim().length !== 6 || sending} onClick={handleVerify}>
                    {sending ? '…' : t.purchaseEmailVerifyButton}
                  </Button>
                  <Button variant="primary" size="lg" fullWidth onClick={skip}>
                    {t.purchaseSkipButton}
                  </Button>
                </div>
              </>
            )}
          </div>
        </ArcadeModal>
      )}
    </AnimatePresence>
  )
}
