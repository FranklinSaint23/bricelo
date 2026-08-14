'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'
import { useLanguage } from '@/components/providers/language-provider'

export function FooterControls() {
  const { theme, toggle: toggleTheme } = useTheme()
  const { lang, toggle: toggleLang } = useLanguage()

  return (
    <div className="flex items-center justify-center gap-3 py-4 border-t border-white/10">
      {/* Langue */}
      <button
        onClick={toggleLang}
        aria-label="Changer de langue"
        className="flex items-center gap-2 h-9 px-4 rounded-full border border-white/20 hover:border-white/50 hover:bg-white/10 transition-colors text-sm font-semibold text-white/80 hover:text-white"
      >
        <span className="text-base leading-none">{lang === 'fr' ? '🇬🇧' : '🇫🇷'}</span>
        <span>{lang === 'fr' ? 'English' : 'Français'}</span>
      </button>

      {/* Thème */}
      <button
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        className="flex items-center gap-2 h-9 px-4 rounded-full border border-white/20 hover:border-white/50 hover:bg-white/10 transition-colors text-sm font-semibold text-white/80 hover:text-white"
      >
        {theme === 'dark'
          ? <><Sun className="h-4 w-4" /> {lang === 'fr' ? 'Mode clair' : 'Light mode'}</>
          : <><Moon className="h-4 w-4" /> {lang === 'fr' ? 'Mode sombre' : 'Dark mode'}</>}
      </button>
    </div>
  )
}
