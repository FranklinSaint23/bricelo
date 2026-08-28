import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Store, Star, Package } from 'lucide-react'
import { ProductCard } from '@/components/product/product-card'
import { Badge } from '@/components/ui/badge'
import { FacebookVerifiedBadge } from '@/components/ui/facebook-verified-badge'
import type { Product } from '@/types'

interface Props { params: Promise<{ slug: string }> }

export default async function StorePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!store) notFound()

  const { data: products } = await supabase
    .from('products')
    .select('*, store:stores(name, slug)')
    .eq('store_id', store.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const joinedDate = new Date(store.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-48 sm:h-64 bg-[var(--color-navy-900)] overflow-hidden">
        {store.banner_url && (
          <Image src={store.banner_url} alt={store.name} fill className="object-cover opacity-60" sizes="100vw" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-navy-900)]/80" />
      </div>

      {/* Store header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative -mt-10 sm:-mt-14 flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-5 pb-6 border-b border-[var(--color-slate-200)]">
          <div className="relative h-20 w-20 sm:h-28 sm:w-28 rounded-2xl overflow-hidden bg-white border-4 border-white shadow-xl shrink-0">
            {store.logo_url
              ? <Image src={store.logo_url} alt={store.name} fill className="object-cover" sizes="112px" />
              : <div className="w-full h-full flex items-center justify-center bg-slate-100"><Store className="h-10 w-10 text-slate-400" /></div>
            }
          </div>

          <div className="pb-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {store.name}
              </h1>
              <FacebookVerifiedBadge className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
            </div>
            <div className="flex items-center gap-3 sm:gap-4 mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex-wrap">
              {store.rating > 0 && (
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  {store.rating.toFixed(1)} ({store.review_count} avis)
                </span>
              )}
              <span className="flex items-center gap-1 font-medium">
                <Package className="h-3.5 w-3.5" />
                {products?.length ?? 0} produit(s)
              </span>
              <span className="font-medium">Depuis {joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {store.description && (
          <p className="mt-6 text-[var(--color-slate-600)] max-w-2xl">{store.description}</p>
        )}

        {/* Products */}
        <div className="mt-8 mb-16">
          <h2 className="text-lg font-bold text-[var(--color-navy-900)] mb-5">
            Tous les produits <span className="text-[var(--color-slate-400)] font-normal">({products?.length ?? 0})</span>
          </h2>

          {!products?.length ? (
            <div className="text-center py-16 text-[var(--color-slate-400)]">
              <Package className="h-12 w-12 mx-auto mb-3" />
              <p>Cette boutique n'a pas encore de produits.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product as unknown as Product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
