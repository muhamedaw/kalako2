import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/i18n/context'
import type { Lang } from '@/i18n/types'

const LANG_OPTIONS: { lang: Lang; label: string }[] = [
  { lang: 'ar', label: 'عربي' },
  { lang: 'en', label: 'EN' },
  { lang: 'he', label: 'עב' },
]

interface Props {
  onNavigate: (page: 'home' | 'how_to_play' | 'about') => void
  currentPage: string
}

export default function Navbar({ onNavigate, currentPage }: Props) {
  const { setLang, currentLang, navHome, navHowToPlay, navAbout } = useTranslation()
  const [langOpen, setLangOpen] = useState(false)

  const links = [
    { id: 'home' as const, label: navHome },
    { id: 'how_to_play' as const, label: navHowToPlay },
    { id: 'about' as const, label: navAbout },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-40">
      <div
        className="mx-auto max-w-lg px-4 py-3 flex items-center justify-between"
        style={{
          background: 'rgba(18,7,31,0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo / brand */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <span
            className="text-lg font-black text-gradient"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            كلاكو
          </span>
        </button>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer
                ${currentPage === link.id
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }
              `}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Language switcher */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white/60 hover:text-white/80 hover:bg-white/8 transition-all cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            {currentLang.toUpperCase()}
          </button>

          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-1 end-0 min-w-[80px] rounded-xl overflow-hidden"
                style={{
                  background: 'rgba(27,14,46,0.95)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                {LANG_OPTIONS.map((opt) => (
                  <button
                    key={opt.lang}
                    onClick={() => { setLang(opt.lang); setLangOpen(false) }}
                    className={`
                      w-full px-3 py-2 text-xs font-medium text-start cursor-pointer transition-colors
                      ${currentLang === opt.lang
                        ? 'bg-primary/15 text-primary'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  )
}
