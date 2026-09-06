'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, ArrowRight, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'

export const RECENTLY_VIEWED_KEY = 'bricelo_recently_viewed'

export interface RecentlyViewedProduct {
  id: string
  name: string
  slug: string
  price: number
  image: string | null
}

export function saveToRecentlyViewed(product: RecentlyViewedProduct) {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY)
    const list: RecentlyViewedProduct[] = raw ? JSON.parse(raw) : []
    const filtered = list.filter(p => p.id !== product.id)
    const updated = [product, ...filtered].slice(0, 12)
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated))
  } catch (err) {
    console.error('Erreur sauvegarde récemment consultés:', err)
  }
}

interface Props {
  excludeId?: string
}

export function RecentlyViewed({ excludeId }: Props = {}) {
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadValidRecentProducts() {
      try {
        const raw = localStorage.getItem(RECENTLY_VIEWED_KEY)
        if (!raw) {
          setLoading(false)
          return
        }

        const all: RecentlyViewedProduct[] = JSON.parse(raw)
        const candidates = excludeId ? all.filter(p => p.id !== excludeId) : all
        if (!candidates.length) {
          setLoading(false)
          return
        }

        const supabase = createClient()
        const ids = candidates.map(c => c.id)

        // Récupérer les produits en base avec leurs variantes et visuels pour corriger les prix 0 et visuels manquants
        const { data: dbProds } = await supabase
          .from('products')
          .select(`
            id, name, slug, price, images, is_active,
            product_variants(price, direct_price, price_adjustment, variant_images(url))
          `)
          .in('id', ids)
          .eq('is_active', true)

        if (dbProds && dbProds.length > 0) {
          const dbMap = new Map(dbProds.map(p => [p.id, p]))

          const cleanedList: RecentlyViewedProduct[] = candidates
            .filter(c => dbMap.has(c.id))
            .map(c => {
              const fresh = dbMap.get(c.id)!
              const vars = (fresh.product_variants as any[]) || []

              // 1. Calcul du Prix Effectif (Gestion des Produits à Variantes)
              let effectivePrice = Number(fresh.price || 0)
              if (effectivePrice <= 0 && vars.length > 0) {
                const firstV = vars[0]
                if (firstV) {
                  const vPrice = firstV.price ?? firstV.direct_price
                  if (vPrice && Number(vPrice) > 0) {
                    effectivePrice = Number(vPrice)
                  } else if (firstV.price_adjustment) {
                    effectivePrice = Number(fresh.price || 0) + Number(firstV.price_adjustment)
                  }
                }

                if (effectivePrice <= 0) {
                  const validVar = vars.find(v => (v.price && Number(v.price) > 0) || (v.direct_price && Number(v.direct_price) > 0))
                  if (validVar) effectivePrice = Number(validVar.price || validVar.direct_price)
                }
              }

              // Fallback sur candidate.price si déjà valide
              if (effectivePrice <= 0 && c.price > 0) {
                effectivePrice = c.price
              }

              // 2. Calcul de l'Image Effective
              let effectiveImage = (Array.isArray(fresh.images) && fresh.images.length > 0) ? fresh.images[0] : null

              if (!effectiveImage && vars.length > 0) {
                for (const v of vars) {
                  if (Array.isArray(v.variant_images) && v.variant_images.length > 0) {
                    const img0 = v.variant_images[0]
                    effectiveImage = typeof img0 === 'string' ? img0 : (img0?.url || null)
                    if (effectiveImage) break
                  }
                }
              }

              // Fallback sur candidate.image si déjà présent
              if (!effectiveImage && c.image) {
                effectiveImage = c.image
              }

              return {
                id: fresh.id,
                name: fresh.name || c.name,
                slug: fresh.slug || c.slug,
                price: effectivePrice,
                image: effectiveImage,
              }
            })
            .filter(p => p.price > 0) // Filtrer strictement les prix zéro ou invalides

          setProducts(cleanedList)
          if (cleanedList.length > 0) {
            localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(cleanedList))
          }
        } else {
          setProducts([])
        }
      } catch (err) {
        console.error('Erreur récemment consultés:', err)
      } finally {
        setLoading(false)
      }
    }

    loadValidRecentProducts()
  }, [excludeId])

  if (loading || products.length === 0) return null

  return (
    <section className="bg-gradient-to-b from-[var(--color-slate-50)] to-white border-t border-[var(--color-slate-200)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-400/20 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[var(--color-navy-900)] tracking-tight">
                Récemment consultés
              </h2>
              <p className="text-[11px] text-[var(--color-slate-500)] font-medium">
                Retrouvez facilement les articles que vous avez explorés
              </p>
            </div>
          </div>

          <Link
            href="/catalogue"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-navy-900)] hover:text-[var(--color-accent)] transition-colors bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs"
          >
            <span>Explorer le catalogue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Carousel / Grille fluide */}
        <div className="flex gap-3.5 overflow-x-auto pb-4 pt-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/produit/${p.slug}`}
              className="shrink-0 w-36 sm:w-44 group bg-white rounded-2xl border border-[var(--color-slate-200)] hover:border-amber-400 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 144px, 176px"
                    />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-slate-100/70 text-slate-400 p-2 text-center">
                      <ShoppingBag className="h-7 w-7 text-slate-300 mb-1" />
                      <span className="text-[10px] font-bold text-slate-400">BRICÉLO</span>
                    </div>
                  )}
                </div>

                {/* Nom */}
                <div className="p-2.5 sm:p-3">
                  <p className="text-xs font-semibold text-[var(--color-navy-900)] line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">
                    {p.name}
                  </p>
                </div>
              </div>

              {/* Prix */}
              <div className="px-2.5 pb-3 sm:px-3">
                <span className="inline-block text-xs sm:text-sm font-extrabold text-[var(--color-navy-900)] bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded-md">
                  {formatPrice(p.price)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
