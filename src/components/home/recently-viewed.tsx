'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, ArrowRight } from 'lucide-react'
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
    const updated = [product, ...filtered].slice(0, 10)
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated))
  } catch {}
}

interface Props {
  excludeId?: string
}

export function RecentlyViewed({ excludeId }: Props = {}) {
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([])

  useEffect(() => {
    async function loadValidRecentProducts() {
      try {
        const raw = localStorage.getItem(RECENTLY_VIEWED_KEY)
        if (!raw) return

        const all: RecentlyViewedProduct[] = JSON.parse(raw)
        const candidates = excludeId ? all.filter(p => p.id !== excludeId) : all
        if (!candidates.length) return

        const supabase = createClient()
        const ids = candidates.map(c => c.id)

        // Vérifier dans Supabase que ces produits existent et sont actifs (purge des anciens produits de test)
        const { data: dbProds } = await supabase
          .from('products')
          .select('id, name, slug, price, images, is_active')
          .in('id', ids)
          .eq('is_active', true)

        if (dbProds && dbProds.length > 0) {
          const dbMap = new Map(dbProds.map(p => [p.id, p]))
          const cleanedList: RecentlyViewedProduct[] = candidates
            .filter(c => dbMap.has(c.id))
            .map(c => {
              const fresh = dbMap.get(c.id)!
              return {
                id: fresh.id,
                name: fresh.name,
                slug: fresh.slug,
                price: fresh.price,
                image: fresh.images?.[0] ?? null,
              }
            })

          setProducts(cleanedList)
          localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(cleanedList))
        } else {
          // Si tous les anciens produits stockés sont des faux tests supprimés, purger le localStorage
          setProducts([])
          localStorage.removeItem(RECENTLY_VIEWED_KEY)
        }
      } catch (err) {
        console.error('Erreur récemment consultés:', err)
      }
    }

    loadValidRecentProducts()
  }, [excludeId])

  if (products.length === 0) return null

  return (
    <section className="bg-white border-t border-[var(--color-slate-200)] py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[var(--color-accent)]" />
            <h2 className="text-lg font-bold text-[var(--color-navy-900)]">Récemment consultés</h2>
          </div>
          <Link href="/catalogue" className="flex items-center gap-1 text-sm text-[var(--color-slate-500)] hover:text-[var(--color-accent)] transition-colors">
            Voir tout <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {products.map((p) => (
            <Link key={p.id} href={`/produit/${p.slug}`}
              className="shrink-0 w-36 sm:w-44 group">
              <div className="aspect-square rounded-xl overflow-hidden bg-[var(--color-slate-100)] border border-[var(--color-slate-200)] mb-2 relative">
                {p.image ? (
                  <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="176px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-4xl text-[var(--color-slate-300)]">📦</div>
                )}
              </div>
              <p className="text-xs font-semibold text-[var(--color-navy-900)] line-clamp-2 leading-tight">{p.name}</p>
              <p className="text-sm font-bold text-[var(--color-accent)] mt-0.5">{formatPrice(p.price)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
