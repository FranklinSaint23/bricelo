import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'

export default async function AdminProduitsPage() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) redirect('/login')

  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, price, stock, images, is_active, created_at, store:stores(name, slug), category:categories(name), variants:product_variants(id, price, stock_quantity, direct_price, images:variant_images(url))')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--color-navy-900)]">Produits</h1>
        <p className="text-sm text-[var(--color-slate-500)] mt-0.5">{products?.length ?? 0} produit{(products?.length ?? 0) > 1 ? 's' : ''} au total</p>
      </div>

      <div className="bg-white rounded-xl border border-[var(--color-slate-200)] overflow-hidden">
        {!products?.length ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <Package className="h-8 w-8 text-[var(--color-slate-200)]" />
            <p className="text-sm text-[var(--color-slate-400)]">Aucun produit.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-slate-50)]">
                <tr>
                  {['Produit', 'Boutique', 'Catégorie', 'Prix', 'Stock', 'Statut'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-slate-400)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-slate-50)]">
                {products.map((p) => {
                  const firstVar = p.variants?.[0]
                  const firstVarWithPrice = p.variants?.find((v: any) => (v.price && Number(v.price) > 0) || (v.direct_price && Number(v.direct_price) > 0)) || firstVar
                  const displayImage = p.images?.[0] || firstVar?.images?.[0]?.url
                  const displayPrice = (firstVarWithPrice?.price && Number(firstVarWithPrice.price) > 0)
                    ? Number(firstVarWithPrice.price)
                    : (firstVarWithPrice?.direct_price && Number(firstVarWithPrice.direct_price) > 0)
                    ? Number(firstVarWithPrice.direct_price)
                    : (p.price && Number(p.price) > 0)
                    ? Number(p.price)
                    : 0
                  const totalVarStock = p.variants && p.variants.length > 0
                    ? p.variants.reduce((sum: number, v: any) => sum + Number(v.stock_quantity ?? v.stock ?? 0), 0)
                    : (Number(p.stock) || 0)
                  const displayStock = totalVarStock

                  return (
                    <tr key={p.id} className="hover:bg-[var(--color-slate-50)] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-9 w-9 shrink-0 rounded-lg overflow-hidden bg-[var(--color-slate-100)]">
                            {displayImage ? (
                              <Image src={displayImage} alt={p.name} fill className="object-cover" sizes="36px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold bg-slate-100">
                                N/A
                              </div>
                            )}
                          </div>
                          <Link href={`/produit/${p.slug}`} target="_blank"
                            className="font-medium text-[var(--color-navy-900)] hover:text-[var(--color-accent)] line-clamp-1 max-w-[200px]">
                            {p.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[var(--color-slate-600)]">{(p.store as any)?.name ?? '—'}</td>
                      <td className="px-5 py-3.5 text-[var(--color-slate-500)]">{(p.category as any)?.name ?? '—'}</td>
                      <td className="px-5 py-3.5 font-bold text-[var(--color-navy-900)]">{formatPrice(displayPrice)}</td>
                      <td className="px-5 py-3.5">
                        <span className={displayStock === 0 ? 'text-red-500 font-medium' : 'text-[var(--color-slate-600)]'}>{displayStock}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={p.is_active ? 'success' : 'warning'} size="sm">
                          {p.is_active ? 'Actif' : 'Masqué'}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
