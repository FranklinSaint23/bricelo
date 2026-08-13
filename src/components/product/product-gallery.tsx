'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props { images: string[]; name: string }

export function ProductGallery({ images, name }: Props) {
  const [active, setActive] = useState(0)

  if (!images.length) {
    return (
      <div className="aspect-square rounded-[var(--radius-xl)] bg-[var(--color-slate-100)] flex items-center justify-center text-[var(--color-slate-300)]">
        <span className="text-6xl">📦</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Image principale */}
      <div className="relative aspect-square rounded-[var(--radius-xl)] overflow-hidden bg-[var(--color-slate-100)]">
        <Image
          src={images[active]}
          alt={`${name} — image ${active + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActive((a) => (a - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActive((a) => (a + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                'relative shrink-0 h-16 w-16 rounded-[var(--radius-md)] overflow-hidden border-2 transition-colors',
                i === active
                  ? 'border-[var(--color-accent)]'
                  : 'border-[var(--color-slate-200)] hover:border-[var(--color-slate-400)]',
              )}
            >
              <Image src={img} alt={`thumb ${i + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
