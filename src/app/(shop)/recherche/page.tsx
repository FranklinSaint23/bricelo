import { createClient } from '@/lib/supabase/server'
import { Search } from 'lucide-react'
import { ProductCard } from '@/components/product/product-card'
import { SearchPagination } from '@/components/product/search-pagination'
import type { Product } from '@/types'

interface Props {
  searchParams: Promise<{ q?: string; page?: string; tri?: string }>
}

const ITEMS_PER_PAGE = 20

export default async function SearchPage({ searchParams }: Props) {
  const { q = '', page = '1', tri = 'pertinence' } = await searchParams
  const currentPage = Math.max(1, parseInt(page))
  const offset = (currentPage - 1) * ITEMS_PER_PAGE
  const query = q.trim()

  const supabase = await createClient()

  let dbQuery = supabase
    .from('products')
    .select('*, store:stores(name, slug), variants:product_variants(id, price, compare_at_price, stock_quantity, direct_price, price_adjustment)', { count: 'exact' })
    .eq('is_active', true)

  if (query) {
    const { data: matchedVariants } = await supabase
      .from('product_variants')
      .select('product_id')
      .or(`sku.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(100)

    const variantProductIds = (matchedVariants ?? []).map((v) => v.product_id).filter(Boolean)

    if (variantProductIds.length > 0) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,id.in.(${variantProductIds.join(',')})`)
    } else {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    }
  }

  switch (tri) {
    case 'prix_asc':  dbQuery = dbQuery.order('price', { ascending: true });  break
    case 'prix_desc': dbQuery = dbQuery.order('price', { ascending: false }); break
    case 'nouveautes': dbQuery = dbQuery.order('created_at', { ascending: false }); break
    case 'mieux_notes': dbQuery = dbQuery.order('rating', { ascending: false }); break
    default: dbQuery = dbQuery.order('created_at', { ascending: false })
  }

  const { data: products, count } = await dbQuery.range(offset, offset + ITEMS_PER_PAGE - 1)
  const totalPages = Math.ceil((count ?? 0) / ITEMS_PER_PAGE)

  const sortOptions = [
    { value: 'pertinence', label: 'Pertinence' },
    { value: 'nouveautes', label: 'Nouveautés' },
    { value: 'prix_asc',   label: 'Prix croissant' },
    { value: 'prix_desc',  label: 'Prix décroissant' },
    { value: 'mieux_notes', label: 'Mieux notés' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        {query ? (
          <>
            <h1 className="text-2xl font-bold text-[var(--color-navy-900)]">
              Résultats pour "{query}"
            </h1>
            <p className="text-sm text-[var(--color-slate-500)] mt-1">{count ?? 0} produit(s) trouvé(s)</p>
          </>
        ) : (
          <h1 className="text-2xl font-bold text-[var(--color-navy-900)]">Tous les produits</h1>
        )}
      </div>

      {/* Tri */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm text-[var(--color-slate-500)]">Trier par :</span>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((opt) => (
            <a
              key={opt.value}
              href={`/recherche?q=${encodeURIComponent(query)}&tri=${opt.value}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                tri === opt.value
                  ? 'bg-[var(--color-navy-900)] text-white'
                  : 'bg-[var(--color-slate-100)] text-[var(--color-slate-600)] hover:bg-[var(--color-slate-200)]'
              }`}
            >
              {opt.label}
            </a>
          ))}
        </div>
      </div>

      {/* Results */}
      {!products?.length ? (
        <div className="text-center py-24 flex flex-col items-center gap-4">
          <Search className="h-12 w-12 text-[var(--color-slate-300)]" />
          <p className="text-lg font-semibold text-[var(--color-navy-900)]">Aucun produit trouvé</p>
          <p className="text-sm text-[var(--color-slate-500)]">
            Essayez un autre terme de recherche ou explorez nos catégories.
          </p>
          <a href="/" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
            Retour à l'accueil
          </a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product as unknown as Product} />
            ))}
          </div>
          {totalPages > 1 && (
            <SearchPagination
              currentPage={currentPage}
              totalPages={totalPages}
              q={query}
              tri={tri}
            />
          )}
        </>
      )}
    </div>
  )
}
