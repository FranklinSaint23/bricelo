import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Eye, EyeOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { ToggleProductButton } from '@/components/vendor/toggle-product-button'
import { DeleteProductButton } from '@/components/vendor/delete-product-button'

export default async function VendorProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: store } = await supabase
    .from('stores')
    .select('id, name')
    .eq('user_id', user.id)
    .single()

  if (!store) redirect('/vendeur')

  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, price, stock, images, is_active, category:categories(name), variants:product_variants(id, price, stock_quantity, direct_price, images:variant_images(url))')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 sm:p-8 max-w-5xl pb-24">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-navy-900)]">Mes produits</h1>
          <p className="text-sm text-[var(--color-slate-500)] mt-0.5">{products?.length ?? 0} produit{(products?.length ?? 0) > 1 ? 's' : ''}</p>
        </div>
        <Button asChild size="md">
          <Link href="/vendeur/produits/nouveau">
            <Plus className="h-4 w-4" /> Ajouter un produit
          </Link>
        </Button>
      </div>

      {!products?.length ? (
        <div className="bg-white rounded-[var(--radius-2xl)] border border-dashed border-[var(--color-slate-300)] p-16 flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 rounded-full bg-[var(--color-slate-100)] flex items-center justify-center">
            <Plus className="h-8 w-8 text-[var(--color-slate-400)]" />
          </div>
          <div>
            <p className="font-semibold text-[var(--color-navy-900)]">Aucun produit pour l'instant</p>
            <p className="text-sm text-[var(--color-slate-500)] mt-1">Ajoutez votre premier produit pour commencer à vendre.</p>
          </div>
          <Button asChild>
            <Link href="/vendeur/produits/nouveau"><Plus className="h-4 w-4" /> Créer un produit</Link>
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[var(--color-slate-200)] overflow-x-auto shadow-xs">
          <table className="w-full min-w-[650px] text-sm whitespace-nowrap">
            <thead className="bg-[var(--color-slate-50)] border-b border-[var(--color-slate-200)]">
              <tr>
                {['Produit', 'Catégorie', 'Prix', 'Stock', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-slate-500)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-slate-100)]">
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 rounded-md overflow-hidden bg-[var(--color-slate-100)]">
                          {displayImage ? (
                            <Image src={displayImage} alt={p.name} fill className="object-cover" sizes="40px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold bg-slate-100">
                              N/A
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-[var(--color-navy-900)] line-clamp-1 max-w-[180px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-slate-500)]">{(p.category as any)?.name ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--color-navy-900)]">{formatPrice(displayPrice)}</td>
                    <td className="px-4 py-3">
                      <span className={displayStock === 0 ? 'text-[var(--color-danger)]' : 'text-green-600'}>{displayStock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.is_active ? 'success' : 'warning'}>{p.is_active ? 'Publié' : 'Masqué'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/vendeur/produits/${p.id}/modifier`}
                          className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-[var(--color-slate-100)] text-[var(--color-slate-500)] hover:text-[var(--color-navy-900)] transition-colors">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <ToggleProductButton productId={p.id} isActive={p.is_active} />
                        <DeleteProductButton productId={p.id} productName={p.name} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
