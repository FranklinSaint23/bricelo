'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function showGlobalLoader() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bricelo:show-loader'))
  }
}

export function hideGlobalLoader() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bricelo:hide-loader'))
  }
}

export function ProductNavigationLoader() {
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()

  // Dès que la route change, on masque le spinner
  useEffect(() => {
    setLoading(false)
  }, [pathname])

  // Écoute des événements manuels et des clics / soumissions
  useEffect(() => {
    const handleShow = () => setLoading(true)
    const handleHide = () => setLoading(false)

    window.addEventListener('bricelo:show-loader', handleShow)
    window.addEventListener('bricelo:hide-loader', handleHide)

    // Attacher à window pour usage simple si besoin
    ;(window as any).__bricelo_show_loader = handleShow
    ;(window as any).__bricelo_hide_loader = handleHide

    // 1. Détection des clics sur les liens principaux de navigation
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (!href) return

      // Ignorer les clics avec touches modificatrices (nouvel onglet)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return

      // Clics vers les fiches produits, boutiques, catalogue, panier, checkout, auth, espaces vendeur et admin
      const isImportantLink =
        href.startsWith('/produit/') ||
        href.startsWith('/boutique/') ||
        href.startsWith('/catalogue') ||
        href.startsWith('/checkout') ||
        href.startsWith('/panier') ||
        href.startsWith('/login') ||
        href.startsWith('/register') ||
        href.startsWith('/vendeur') ||
        href.startsWith('/admin')

      if (isImportantLink && href !== pathname) {
        setLoading(true)
      }
    }

    // 2. Détection de la soumission de formulaires (connexion, inscription, déconnexion, produits, checkout)
    const handleSubmit = (e: SubmitEvent) => {
      // Vérifier si le formulaire est valide HTML5
      const form = e.target as HTMLFormElement
      if (form && form.checkValidity && !form.checkValidity()) {
        return // Le navigateur va afficher l'erreur native de validation
      }
      setLoading(true)
    }

    document.addEventListener('click', handleClick, { capture: true })
    document.addEventListener('submit', handleSubmit, { capture: true })

    return () => {
      window.removeEventListener('bricelo:show-loader', handleShow)
      window.removeEventListener('bricelo:hide-loader', handleHide)
      document.removeEventListener('click', handleClick, { capture: true })
      document.removeEventListener('submit', handleSubmit, { capture: true })
    }
  }, [pathname])

  // Sécurité : timeout automatique pour ne jamais bloquer l'interface
  useEffect(() => {
    if (!loading) return
    const timer = setTimeout(() => setLoading(false), 8000)
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
          className="h-12 w-12 sm:h-14 sm:w-14 animate-spin text-amber-500 drop-shadow-[0_2px_12px_rgba(245,158,11,0.5)]"
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
