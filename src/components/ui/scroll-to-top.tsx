'use client'

import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 320)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={scrollTop}
      aria-label="Remonter en haut"
      className={cn(
        'fixed bottom-24 right-4 z-50 h-11 w-11 rounded-full shadow-lg border border-white/20',
        'bg-[var(--color-navy-900)] text-white',
        'flex items-center justify-center',
        'hover:bg-[var(--color-navy-950)] transition-all duration-300',
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none',
      )}
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  )
}
