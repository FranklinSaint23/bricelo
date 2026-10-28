'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <svg
      className={cn('animate-spin text-[var(--color-accent)]', sizes[size], className)}
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Chargement"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export function PageLoader() {
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalBodyTouchAction = document.body.style.touchAction

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'

    const preventScroll = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
    }

    window.addEventListener('wheel', preventScroll, { passive: false })
    window.addEventListener('touchmove', preventScroll, { passive: false })

    return () => {
      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.touchAction = originalBodyTouchAction
      window.removeEventListener('wheel', preventScroll)
      window.removeEventListener('touchmove', preventScroll)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm pointer-events-auto touch-none select-none overscroll-none cursor-wait"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onTouchMove={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onWheel={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <Spinner size="lg" />
    </div>
  )
}
