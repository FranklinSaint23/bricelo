'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'
export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  mode: 'system',
  setMode: () => {},
  toggle: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system')
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  const applyTheme = (currentMode: ThemeMode) => {
    let resolved: Theme = 'light'
    if (currentMode === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      resolved = currentMode
    }
    setTheme(resolved)
    document.documentElement.setAttribute('data-theme', resolved)
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  useEffect(() => {
    const savedMode = (localStorage.getItem('bricelo-theme-mode') as ThemeMode | null) ?? 
                      (localStorage.getItem('bricelo-theme') as ThemeMode | null) ?? 
                      'system'
    setModeState(savedMode)
    applyTheme(savedMode)
    setMounted(true)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemChange = () => {
      const currentSavedMode = (localStorage.getItem('bricelo-theme-mode') as ThemeMode | null) ?? 
                               (localStorage.getItem('bricelo-theme') as ThemeMode | null) ?? 
                               'system'
      if (currentSavedMode === 'system') {
        applyTheme('system')
      }
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange)
    } else {
      mediaQuery.addListener(handleSystemChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemChange)
      } else {
        mediaQuery.removeListener(handleSystemChange)
      }
    }
  }, [])

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode)
    localStorage.setItem('bricelo-theme-mode', newMode)
    localStorage.setItem('bricelo-theme', newMode)
    applyTheme(newMode)
  }

  const toggle = () => {
    if (mode === 'light') setMode('dark')
    else if (mode === 'dark') setMode('system')
    else setMode('light')
  }

  return (
    <ThemeContext.Provider value={{ theme: mounted ? theme : 'light', mode, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
