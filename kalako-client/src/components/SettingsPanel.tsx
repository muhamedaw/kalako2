import { AnimatePresence, motion } from 'framer-motion'
import { X, Globe, Info, HelpCircle } from 'lucide-react'
import { useNavigationStore } from '@/store/navigationStore'
import { useGameStore } from '@/store/gameStore'
import { useTranslation } from '@/i18n/context'
import type { Lang } from '@/i18n/types'

const LANG_OPTIONS: { lang: Lang; label: string }[] = [
  { lang: 'ar', label: 'عربي' },
  { lang: 'en', label: 'EN' },
  { lang: 'he', label: 'עב' },
]

export default function SettingsPanel() {
  const { isSettingsPanelOpen, toggleSettingsPanel } = useNavigationStore()
  const setScreen = useGameStore((s) => s.setScreen)
  const t = useTranslation()
  const { setLang, currentLang, navAbout, navHowToPlay, settingsTitle } = t

  const go = (page: 'about' | 'how_to_play') => {
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
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed top-4 start-4 end-4 sm:start-4 sm:end-auto sm:w-80 z-[61] rounded-2xl overflow-hidden"
            style={{
              background: '#2B6FFF',
              border: '4px solid #0A0A0A',
              boxShadow: '8px 8px 0 #0A0A0A',
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h2 className="text-sm font-bold text-white">{settingsTitle}</h2>
              <button onClick={toggleSettingsPanel} className="cursor-pointer text-white/50 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-2 text-xs font-medium text-white/40">
                  <Globe size={14} />
                  {currentLang.toUpperCase()}
                </span>
                <div className="flex gap-2">
                  {LANG_OPTIONS.map((opt) => (
                    <button
                      key={opt.lang}
                      onClick={() => setLang(opt.lang)}
                      className={`
                        flex-1 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors
                        ${currentLang === opt.lang
                          ? 'bg-[#FFD400] text-[#0A0A0A] font-bold'
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
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
