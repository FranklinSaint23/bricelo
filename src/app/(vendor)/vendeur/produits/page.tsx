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
    .select('id, name, slug, price, stock, images, is_active, category:categories(name)')
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
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--color-slate-50)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 rounded-md overflow-hidden bg-[var(--color-slate-100)]">
                        {p.images?.[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="40px" />}
                      </div>
                      <span className="font-medium text-[var(--color-navy-900)] line-clamp-1 max-w-[180px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-slate-500)]">{(p.category as any)?.name ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--color-navy-900)]">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock === 0 ? 'text-[var(--color-danger)]' : 'text-green-600'}>{p.stock}</span>
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
