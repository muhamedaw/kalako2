import { createContext, useContext } from 'react'
import type { Lang, Translations } from './types'

export interface I18nContextValue extends Translations {
  setLang: (l: Lang) => void
  currentLang: Lang
}

export const I18nContext = createContext<I18nContextValue | null>(null)

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider')
  return ctx
}
