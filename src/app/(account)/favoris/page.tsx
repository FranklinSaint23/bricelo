import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Heart } from 'lucide-react'
import { ProductCard } from '@/components/product/product-card'

export default async function FavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      product_id,
      product:products (
        id, name, slug, price, compare_at_price, images, is_active,
        store:stores ( name, slug )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const products = (favorites ?? [])
    .map((f) => f.product as any)
    .filter(Boolean)
    .filter((p: any) => p.is_active)

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-[var(--color-navy-900)] mb-8">Mes favoris</h1>

      {!products.length ? (
        <div className="bg-white rounded-[var(--radius-2xl)] border border-dashed border-[var(--color-slate-300)] p-16 flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 rounded-full bg-[var(--color-slate-100)] flex items-center justify-center">
            <Heart className="h-8 w-8 text-[var(--color-slate-400)]" />
          </div>
          <div>
            <p className="font-semibold text-[var(--color-navy-900)]">Aucun favori pour l'instant</p>
            <p className="text-sm text-[var(--color-slate-500)] mt-1">Cliquez sur le cœur d'un produit pour le retrouver ici.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
