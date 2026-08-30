'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { useState } from 'react'
import { cn, formatPrice } from '@/lib/utils'
import { PromoTimer } from '@/components/ui/promo-timer'
import { useLanguage } from '@/components/providers/language-provider'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product & { promotion_label?: string | null; is_new?: boolean }
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [wished, setWished] = useState(false)
  const { t } = useLanguage()

  const rawVariants = (product as any).variants ?? []
  const sortedVariants = [...rawVariants].sort((a: any, b: any) => {
    if (a.created_at && b.created_at) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
    return String(a.id).localeCompare(String(b.id))
  })
  const variants = sortedVariants
  const hasVariants = variants.length > 0

  let effectivePrice = product.price ?? 0
  let effectiveCompareAt = product.compare_at_price
  let totalStock = product.stock ?? 0

  let firstVariant: any = null
  let firstVarImage: string | null = null

  if (hasVariants) {
    totalStock = sortedVariants.reduce((acc: number, v: any) => acc + Number(v.stock_quantity ?? v.stock ?? 0), 0)
    firstVariant = sortedVariants[0]

    if (firstVariant) {
      const vPrice = firstVariant.price ?? firstVariant.direct_price
      if (vPrice && Number(vPrice) > 0) {
        effectivePrice = Number(vPrice)
      } else if (firstVariant.price_adjustment) {
        effectivePrice = (product.price ?? 0) + Number(firstVariant.price_adjustment)
      }

      if (firstVariant.compare_at_price !== undefined && firstVariant.compare_at_price !== null && Number(firstVariant.compare_at_price) > 0) {
        effectiveCompareAt = Number(firstVariant.compare_at_price)
      }

      // Extraction de l'image de la 1ère variante s'il en existe une
      if (Array.isArray(firstVariant.images) && firstVariant.images.length > 0) {
        const img0 = firstVariant.images[0]
        firstVarImage = typeof img0 === 'string' ? img0 : (img0?.url || img0?.image_url || null)
      } else if (typeof firstVariant.url === 'string') {
        firstVarImage = firstVariant.url
      } else if (typeof firstVariant.image_url === 'string') {
        firstVarImage = firstVariant.image_url
      }
    }

    if (!effectivePrice || effectivePrice === 0) {
      const pricedVariant = sortedVariants.find((v: any) => Number(v.price ?? v.direct_price) > 0)
      if (pricedVariant) {
        effectivePrice = Number(pricedVariant.price ?? pricedVariant.direct_price)
        if (pricedVariant.compare_at_price && Number(pricedVariant.compare_at_price) > 0) {
          effectiveCompareAt = Number(pricedVariant.compare_at_price)
        }
      }
    }
  }

  const displayImage = firstVarImage || product.images?.[0] || null

  const discount = effectiveCompareAt && effectiveCompareAt > effectivePrice
    ? Math.round(((effectiveCompareAt - effectivePrice) / effectiveCompareAt) * 100)
    : 0

  return (
    <div className={cn(
      'group relative bg-white rounded-xl border border-[var(--color-slate-200)] overflow-hidden',
      'transition-all duration-200 hover:shadow-md hover:border-[var(--color-slate-300)]',
      className,
    )}>
      {/* Image */}
      <Link href={`/produit/${product.slug}`} className="block relative overflow-hidden bg-[var(--color-slate-50)]" style={{ aspectRatio: '1/1' }}>
        {displayImage ? (
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 25vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-slate-100)]">
            <ShoppingCart className="h-8 w-8 text-[var(--color-slate-300)]" />
          </div>
        )}

        {totalStock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-[var(--color-slate-700)] text-white text-[11px] font-semibold px-3 py-1 rounded-full">
              {t.outOfStock}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-[var(--color-danger)] text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
              -{discount}%
            </span>
          )}
          {product.promotion_label && (
            <span className="bg-[var(--color-accent)] text-[var(--color-navy-900)] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
              {product.promotion_label}
            </span>
          )}
          {product.is_new && !discount && !product.promotion_label && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              {t.newBadge}
            </span>
          )}
        </div>

        {/* Favori */}
        <button
          onClick={(e) => { e.preventDefault(); setWished(!wished) }}
          className={cn(
            'absolute top-2 right-2 h-7 w-7 rounded-full flex items-center justify-center',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            wished
              ? 'bg-red-50 text-red-500 !opacity-100'
              : 'bg-white/80 text-[var(--color-slate-400)] hover:text-red-400',
          )}
          aria-label={t.addToWishlist}
        >
          <Heart className={cn('h-3.5 w-3.5', wished && 'fill-current')} />
        </button>

        {/* Hover bar */}
        {totalStock > 0 && (
          <div className="absolute bottom-0 inset-x-0 bg-[var(--color-navy-900)]/90 text-white text-xs font-semibold py-2 flex items-center justify-center gap-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200 pointer-events-none">
            <ShoppingCart className="h-3 w-3" /> {t.viewProduct}
          </div>
        )}
      </Link>

      {/* Infos */}
      <div className="p-3">
        {product.store && (
          <Link href={`/boutique/${product.store.slug}`}
            className="text-[10px] text-[var(--color-slate-400)] hover:text-[var(--color-accent)] transition-colors block truncate mb-1"
            onClick={(e) => e.stopPropagation()}>
            {product.store.name}
          </Link>
        )}

        <Link href={`/produit/${product.slug}`}>
          <h3 className="text-sm font-medium text-[var(--color-navy-900)] line-clamp-2 leading-snug hover:text-[var(--color-accent)] transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.review_count > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn('h-2.5 w-2.5',
                  i < Math.round(product.rating)
                    ? 'fill-[var(--color-accent)] text-[var(--color-accent)]'
                    : 'fill-[var(--color-slate-200)] text-[var(--color-slate-200)]'
                )} />
              ))}
            </div>
            <span className="text-[10px] text-[var(--color-slate-400)]">({product.review_count})</span>
          </div>
        )}

        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="text-sm font-bold text-[var(--color-navy-900)]">
            {formatPrice(effectivePrice)}
          </span>
          {effectiveCompareAt && effectiveCompareAt > effectivePrice && (
            <span className="text-sm font-bold text-[var(--color-slate-400)] line-through">
              {formatPrice(effectiveCompareAt)}
            </span>
          )}
        </div>

        {((effectiveCompareAt && effectiveCompareAt > effectivePrice) || (product as any).promo_ends_at || (product as any).promotion_label) && (
          <PromoTimer className="mt-1.5" endsAt={(product as any).promo_ends_at} />
        )}

        {totalStock > 0 && totalStock <= 5 && (
          <p className="text-[10px] text-[var(--color-danger)] mt-1">{t.lowStock(totalStock)}</p>
        )}
      </div>
    </div>
  )
}
