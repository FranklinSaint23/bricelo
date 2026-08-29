import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/product/product-card'
import { CatalogueFilters } from '@/components/product/catalogue-filters'
import { CataloguePagination } from '@/components/product/catalogue-pagination'
import { PAGE_SIZE } from '@/lib/constants'

import { VendorCtaBanner } from '@/components/common/vendor-cta-banner'

export const metadata: Metadata = { title: 'Catalogue' }

interface PageProps {
  searchParams: Promise<{
    categorie?: string
    q?: string
    tri?: string
    min?: string
    max?: string
    page?: string
  }>
}

export default async function CataloguePage({ searchParams }: PageProps) {
  const params = await searchParams
  const page    = Math.max(1, Number(params.page ?? 1))
  const from    = (page - 1) * PAGE_SIZE
  const to      = from + PAGE_SIZE - 1

  const supabase = await createClient()

  // Catégories pour le filtre
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .is('parent_id', null)
    .order('name')

  // Construction de la requête produits
  let query = supabase
    .from('products')
    .select(
      'id, name, slug, price, compare_at_price, promo_ends_at, images, rating, review_count, stock, store:stores(id, name, slug), variants:product_variants(id, price, compare_at_price, stock_quantity, direct_price, price_adjustment)',
      { count: 'exact' },
    )
    .eq('is_active', true)

  if (params.q) {
    query = query.ilike('name', `%${params.q}%`)
  }

  if (params.categorie) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.categorie)
      .single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (params.min) query = query.gte('price', Number(params.min))
  if (params.max) query = query.lte('price', Number(params.max))

  switch (params.tri) {
    case 'price_asc':  query = query.order('price', { ascending: true });  break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    case 'popular':    query = query.order('review_count', { ascending: false }); break
    default:           query = query.order('created_at', { ascending: false })
  }

  const { data: products, count } = await query.range(from, to)
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-navy-900)]">
            {params.q ? `Résultats pour "${params.q}"` : 'Catalogue'}
          </h1>
          <p className="text-sm text-[var(--color-slate-500)] mt-0.5">
            {count ?? 0} produit{(count ?? 0) > 1 ? 's' : ''} trouvé{(count ?? 0) > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filtres */}
          <aside className="lg:w-60 shrink-0">
            <Suspense fallback={<div className="h-64 rounded-[var(--radius-lg)] bg-[var(--color-slate-100)] animate-pulse" />}>
              <CatalogueFilters
                categories={categories ?? []}
                currentCategory={params.categorie}
                currentMin={params.min}
                currentMax={params.max}
                currentTri={params.tri}
              />
            </Suspense>
          </aside>

          {/* Grille produits */}
          <div className="flex-1">
            {!products?.length ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-[var(--color-navy-900)]">Aucun produit trouvé</h3>
                <p className="text-sm text-[var(--color-slate-500)] mt-1">Essayez avec d'autres filtres ou termes de recherche.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product as any} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Suspense fallback={null}>
                      <CataloguePagination currentPage={page} totalPages={totalPages} />
                    </Suspense>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bannière de CTA Vendeur & Académie */}
      <VendorCtaBanner />
    </>
  )
}
