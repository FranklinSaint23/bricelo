'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props { images: string[]; name: string }

export function ProductGallery({ images, name }: Props) {
  const [active, setActive] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Réinitialiser la première image si le tableau d'images change (ex: changement de variante)
  useEffect(() => {
    setActive(0)
  }, [images])

  // Défilé automatique (Auto-play) toutes les 3 secondes si non survolé
  useEffect(() => {
    if (!images || images.length <= 1 || isHovered) return

    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % images.length)
    }, 3000)

    return () => clearInterval(timer)
  }, [images, isHovered])

  if (!images || !images.length) {
    return (
      <div className="aspect-square rounded-[var(--radius-xl)] bg-[var(--color-slate-100)] flex items-center justify-center text-[var(--color-slate-300)]">
        <span className="text-6xl">📦</span>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col gap-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image principale */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-900/50 border border-slate-800/80 group shadow-md">
        <Image
          src={images[active] || images[0]}
          alt={`${name} — image ${active + 1}`}
          fill
          className="object-contain transition-all duration-500 ease-in-out"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />

        {/* Flèches de navigation (Toujours affichées et très bien placées) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActive((a) => (a - 1 + images.length) % images.length)}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-9 w-9 bg-slate-950/80 text-white rounded-full flex items-center justify-center shadow-lg border border-white/20 hover:bg-amber-400 hover:text-slate-950 transition-all hover:scale-110 active:scale-95 z-10"
              aria-label="Image précédente"
            >
              <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => setActive((a) => (a + 1) % images.length)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-9 w-9 bg-slate-950/80 text-white rounded-full flex items-center justify-center shadow-lg border border-white/20 hover:bg-amber-400 hover:text-slate-950 transition-all hover:scale-110 active:scale-95 z-10"
              aria-label="Image suivante"
            >
              <ChevronRight className="h-5 w-5 stroke-[2.5]" />
            </button>
          </>
        )}
      </div>

      {/* Vignettes de sélection */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'relative shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-all',
                i === active
                  ? 'border-amber-400 ring-2 ring-amber-400/30 scale-105 shadow-sm'
                  : 'border-slate-700/60 hover:border-slate-500 opacity-70 hover:opacity-100',
              )}
            >
              <Image src={img} alt={`Vignette ${i + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
