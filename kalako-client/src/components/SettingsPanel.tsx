import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { X, Globe, Info, HelpCircle, Shield, FileText, RotateCcw, Crown, Lightbulb } from 'lucide-react'
import { useNavigationStore } from '@/store/navigationStore'
import { useGameStore } from '@/store/gameStore'
import { useTranslation } from '@/i18n/context'
import type { Lang } from '@/i18n/types'
import { useEffect, useCallback } from 'react'
import { useFocusTrap } from '@/lib/useFocusTrap'

const LANG_OPTIONS: { lang: Lang; label: string }[] = [
  { lang: 'ar', label: 'عربي' },
  { lang: 'en', label: 'EN' },
  { lang: 'he', label: 'עב' },
]

export default function SettingsPanel() {
  const { isSettingsPanelOpen, toggleSettingsPanel } = useNavigationStore()
  const setScreen = useGameStore((s) => s.setScreen)
  const suggestQuestion = useGameStore((s) => s.suggestQuestion)
  const t = useTranslation()
  const { setLang, currentLang, navAbout, navHowToPlay, navLegalPrivacy, navLegalTerms, navLegalRefund, settingsTitle, settingsLegalLabel } = t

  const [suggestOpen, setSuggestOpen] = useState(false)
  const [suggestCategory, setSuggestCategory] = useState('')
  const [suggestQuestionText, setSuggestQuestionText] = useState('')
  const [suggestAnswer, setSuggestAnswer] = useState('')
  const [suggestSubmitted, setSuggestSubmitted] = useState(false)

  const handleSuggestSubmit = () => {
    if (!suggestCategory.trim() || !suggestQuestionText.trim() || !suggestAnswer.trim()) return
    suggestQuestion({ category: suggestCategory.trim(), question: suggestQuestionText.trim(), answer: suggestAnswer.trim() })
    setSuggestSubmitted(true)
    setSuggestCategory('')
    setSuggestQuestionText('')
    setSuggestAnswer('')
    setTimeout(() => setSuggestSubmitted(false), 3000)
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') toggleSettingsPanel()
  }, [toggleSettingsPanel])

  useEffect(() => {
    if (isSettingsPanelOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSettingsPanelOpen, handleKeyDown])

  // The panel markup below only mounts while isSettingsPanelOpen is true (AnimatePresence
  // unmounts it on close), so the trap's lifetime naturally matches "open".
  const dialogRef = useFocusTrap<HTMLDivElement>(isSettingsPanelOpen)

  type LegalPage = 'legal_privacy' | 'legal_terms' | 'legal_refund'
  const go = (page: 'about' | 'how_to_play' | 'premium' | LegalPage) => {
    setScreen(page)
    toggleSettingsPanel()
  }

  return (
    <AnimatePresence>
      {isSettingsPanelOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSettingsPanel}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed top-4 start-4 end-4 sm:start-4 sm:end-auto sm:w-80 z-[61] rounded-2xl overflow-hidden outline-none"
            style={{
              background: '#3A2143',
              border: '4px solid #0A0A0A',
              boxShadow: '8px 8px 0 #0A0A0A',
            }}
            role="dialog"
            aria-modal="true"
            aria-label={settingsTitle}
            tabIndex={-1}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h2 className="text-sm font-bold text-white">{settingsTitle}</h2>
              <button onClick={toggleSettingsPanel} aria-label={t.settingsCloseAria} className="cursor-pointer text-white/50 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-2 text-xs font-medium text-white/50">
                  <Globe size={14} />
                  {currentLang.toUpperCase()}
                </span>
                <div className="flex gap-2">
                  {LANG_OPTIONS.map((opt) => (
                    <button
                      key={opt.lang}
                      onClick={() => {
                        setLang(opt.lang)
                        useGameStore.getState().setLanguage(opt.lang)
                      }}
                      className={`
                        flex-1 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors
                        ${currentLang === opt.lang
                          ? 'bg-[#FF6B35] text-[#0A0A0A] font-bold'
                          : 'bg-white/10 text-white/70 hover:text-white border border-white/10'
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1 pt-2 border-t border-white/10">
                <button
                  onClick={() => go('about')}
                  className="flex items-center gap-2.5 px-2 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-start"
                >
                  <Info size={16} />
                  {navAbout}
                </button>
                <button
                  onClick={() => go('how_to_play')}
                  className="flex items-center gap-2.5 px-2 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-start"
                >
                  <HelpCircle size={16} />
                  {navHowToPlay}
                </button>
                <button
                  onClick={() => go('premium')}
                  className="flex items-center gap-2.5 px-2 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-start"
                >
                  <Crown size={16} />
                  {t.navPremium}
                </button>
                <button
                  onClick={() => setSuggestOpen(!suggestOpen)}
                  className="flex items-center gap-2.5 px-2 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-start"
                >
                  <Lightbulb size={16} />
                  {t.suggestQuestionFormTitle}
                </button>
                {suggestOpen && (
                  <div className="flex flex-col gap-2 px-2 py-2">
                    {suggestSubmitted ? (
                      <p className="text-xs text-success font-medium">{t.suggestQuestionThankYou}</p>
                    ) : (
                      <>
                        <input
                          value={suggestCategory}
                          onChange={(e) => setSuggestCategory(e.target.value)}
                          placeholder={t.suggestQuestionCategoryLabel}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-primary/50"
                          maxLength={30}
                        />
                        <textarea
                          value={suggestQuestionText}
                          onChange={(e) => setSuggestQuestionText(e.target.value)}
                          placeholder={t.suggestQuestionQuestionLabel}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-primary/50 resize-none"
                          rows={2}
                          maxLength={200}
                        />
                        <input
                          value={suggestAnswer}
                          onChange={(e) => setSuggestAnswer(e.target.value)}
                          placeholder={t.suggestQuestionAnswerLabel}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-primary/50"
                          maxLength={140}
                        />
                        <button
                          onClick={handleSuggestSubmit}
                          disabled={!suggestCategory.trim() || !suggestQuestionText.trim() || !suggestAnswer.trim()}
                          className="w-full px-3 py-2 rounded-lg bg-[#FF6B35] text-[#0A0A0A] text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t.suggestQuestionSubmitButton}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1 pt-2 border-t border-white/10">
                <span className="flex items-center gap-2 text-[10px] font-medium text-white/50 px-2 pb-1">
                  <FileText size={12} />
                  {settingsLegalLabel}
                </span>
                <button
                  onClick={() => go('legal_privacy')}
                  className="flex items-center gap-2.5 px-2 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-start"
                >
                  <Shield size={16} />
                  {navLegalPrivacy}
                </button>
                <button
                  onClick={() => go('legal_terms')}
                  className="flex items-center gap-2.5 px-2 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-start"
                >
                  <FileText size={16} />
                  {navLegalTerms}
                </button>
                <button
                  onClick={() => go('legal_refund')}
                  className="flex items-center gap-2.5 px-2 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-start"
                >
                  <RotateCcw size={16} />
                  {navLegalRefund}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
