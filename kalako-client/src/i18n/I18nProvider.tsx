import { useState, useCallback, useEffect, type ReactNode } from 'react'
import { I18nContext, type I18nContextValue } from './context'
import { ar, en, he } from './index'
import type { Lang } from './types'

const STORAGE_KEY = 'kalako_lang'
const allLangs: Record<Lang, typeof ar> = { ar, en, he }

function getInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && saved in allLangs) return saved as Lang
  } catch { /* ignore */ }
  return 'ar'
}

interface Props {
  children: ReactNode
}

export default function I18nProvider({ children }: Props) {
  const [lang, setLangState] = useState<Lang>(getInitialLang)
  const t = allLangs[lang]

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch { /* ignore */ }
    document.documentElement.lang = l
    document.documentElement.dir = allLangs[l].dir
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = t.dir
  }, [lang, t.dir])

  const value: I18nContextValue = {
    ...t,
    setLang,
    currentLang: lang,
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}
