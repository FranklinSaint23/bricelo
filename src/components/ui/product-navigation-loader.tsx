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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-sm pointer-events-none transition-all duration-150 animate-in fade-in"
      aria-hidden="true"
    >
      {/* Spinner style Facebook : simple anneau jaune vif pur qui tourne dans le vide, sans modal ni boîte */}
      <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-full border-[3.5px] border-amber-400/25 border-t-amber-500 animate-spin" />
    </div>
  )
}
