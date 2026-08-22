'use client'

import { Sun, Moon, Smartphone } from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'
import { useLanguage } from '@/components/providers/language-provider'

export function FooterControls() {
  const { mode, toggle: toggleTheme } = useTheme()
  const { lang, toggle: toggleLang } = useLanguage()

  const getThemeLabel = () => {
    if (mode === 'light') {
      return <><Sun className="h-4 w-4 text-amber-400" /> {lang === 'fr' ? 'Mode clair' : 'Light mode'}</>
    }
    if (mode === 'dark') {
      return <><Moon className="h-4 w-4 text-indigo-400" /> {lang === 'fr' ? 'Mode sombre' : 'Dark mode'}</>
    }
    return <><Smartphone className="h-4 w-4 text-emerald-400" /> {lang === 'fr' ? 'Mode adaptatif (Système)' : 'Adaptive mode (System)'}</>
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-4 border-t border-white/10">
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
        aria-label="Changer le mode de luminosité"
        title={lang === 'fr' ? 'Cliquer pour alterner (Clair / Sombre / Adaptatif)' : 'Click to cycle (Light / Dark / Adaptive)'}
        className="flex items-center gap-2 h-9 px-4 rounded-full border border-white/20 hover:border-white/50 hover:bg-white/10 transition-colors text-sm font-semibold text-white/80 hover:text-white"
      >
        {getThemeLabel()}
      </button>
    </div>
  )
}
