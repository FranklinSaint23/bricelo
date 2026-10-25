'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function ProductNavigationLoader() {
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()

  // Dès que la navigation aboutit sur la page produit, on masque le spinner
  useEffect(() => {
    setLoading(false)
  }, [pathname])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Détecter si le clic cible un lien menant vers une fiche produit
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (href && href.startsWith('/produit/')) {
        // Ignorer les clics avec touches modificatrices (ouverture dans nouvel onglet)
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return

        // Si on est déjà sur ce même produit, ne pas réafficher
        if (pathname === href) return

        setLoading(true)
      }
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => {
      document.removeEventListener('click', handleClick, { capture: true })
    }
  }, [pathname])

  // Sécurité : timeout automatique pour ne jamais bloquer l'interface
  useEffect(() => {
    if (!loading) return
    const timer = setTimeout(() => setLoading(false), 7000)
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setLoading(false)
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [loading])

  if (!loading) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/25 dark:bg-black/50 backdrop-blur-md pointer-events-none transition-all duration-200 animate-in fade-in"
      aria-hidden="true"
    >
      {/* Spinner style Facebook : simple arc jaune vif pur tournant dans les airs sans modal ni boîte */}
      <div className="relative flex items-center justify-center">
        <svg
          className="h-12 w-12 animate-spin text-amber-500 drop-shadow-[0_2px_10px_rgba(245,158,11,0.45)]"
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="25"
            cy="25"
            r="19"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray="80 150"
            strokeDashoffset="0"
          />
        </svg>
      </div>
    </div>
  )
}
