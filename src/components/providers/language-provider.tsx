'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { fr, en, type Translations } from '@/lib/i18n/translations'

export type Lang = 'fr' | 'en'

interface LanguageContextValue {
  lang: Lang
  t: Translations
  toggle: () => void
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'fr',
  t: fr,
  toggle: () => {},
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('fr')

  useEffect(() => {
    const saved = localStorage.getItem('bricelo-lang') as Lang | null
    if (saved === 'fr' || saved === 'en') {
      setLang(saved)
      document.documentElement.setAttribute('lang', saved)
    }
  }, [])

  function toggle() {
    const next: Lang = lang === 'fr' ? 'en' : 'fr'
    setLang(next)
    localStorage.setItem('bricelo-lang', next)
    document.documentElement.setAttribute('lang', next)
  }

  return (
    <LanguageContext.Provider value={{ lang, t: lang === 'fr' ? fr : en, toggle }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
