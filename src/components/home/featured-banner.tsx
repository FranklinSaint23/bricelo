'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Star, ArrowRight } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

type P = Product & { promotion_label?: string | null; is_new?: boolean }

interface Props { products: P[] }

export function FeaturedBannerMobile({ products }: Props) {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const next = useCallback(() => setIdx(i => (i + 1) % products.length), [products.length])
  const prev = useCallback(() => setIdx(i => (i - 1 + products.length) % products.length), [products.length])

  useEffect(() => {
    if (paused || products.length < 2) return
    const t = setInterval(next, 4500)
    return () => clearInterval(t)
  }, [paused, next, products.length])

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = touchStartX.current - e.changedTouches[0].clientX
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY)
    if (Math.abs(dx) > 40 && Math.abs(dx) > dy) dx > 0 ? next() : prev()
  }

  const product = products[idx]
  if (!product) return null
  const image = product.images?.[0] ?? null
  const discountPct = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null

  return (
    <div className="sm:hidden"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      <Link href={`/produit/${product.slug}`} key={idx} className="slide-fade block relative rounded-2xl overflow-hidden bg-[var(--color-navy-900)] shadow-md">
        {/* Image */}
        <div className="relative h-56 w-full bg-[var(--color-navy-800)]">
          {image ? (
            <Image src={image} alt={product.name} fill className="object-cover opacity-80" sizes="100vw" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">📦</div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-navy-950)] via-[var(--color-navy-900)]/40 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {product.is_new && (
              <span className="bg-[var(--color-accent)] text-[var(--color-navy-900)] text-[10px] font-bold px-2 py-0.5 rounded-full">NOUVEAU</span>
            )}
            {discountPct && (
              <span className="bg-[var(--color-danger)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{discountPct}%</span>
            )}
            {product.promotion_label && !discountPct && (
              <span className="bg-[var(--color-danger)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{product.promotion_label}</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 bg-[var(--color-navy-950)]">
          <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1">Produit vedette</p>
          <h3 className="text-white font-bold text-base leading-snug line-clamp-2">{product.name}</h3>

          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-[var(--color-accent)] font-extrabold text-xl leading-none">{formatPrice(product.price)}</p>
              {product.compare_at_price && (
                <p className="text-white/30 text-xs line-through mt-0.5">{formatPrice(product.compare_at_price)}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {(product.rating ?? 0) > 0 && (
                <div className="flex items-center gap-0.5">
                  <Star className="h-3.5 w-3.5 fill-[var(--color-accent)] text-[var(--color-accent)]" />
                  <span className="text-white/60 text-xs font-medium">{product.rating?.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-[var(--color-accent)] text-sm font-semibold">
            Voir le produit <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </Link>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {products.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={cn('rounded-full transition-all duration-300', i === idx
              ? 'w-5 h-1.5 bg-[var(--color-navy-900)]'
              : 'w-1.5 h-1.5 bg-[var(--color-slate-300)] hover:bg-[var(--color-slate-400)]')} />
        ))}
      </div>
    </div>
  )
}
