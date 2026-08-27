import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ProductForm } from '@/components/vendor/product-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: store } = await supabase
    .from('stores')
    .select('id, name')
    .eq('user_id', user.id)
    .single()

  if (!store) redirect('/vendeur')

  const { data: product } = await supabase
    .from('products')
    .select('id, name, slug, description, price, compare_at_price, stock, category_id, images, is_active, is_featured')
    .eq('id', id)
    .eq('store_id', store.id)
    .single()

  if (!product) notFound()

  // Récupérer les options relationnelles du produit
  const { data: optionsData } = await supabase
    .from('product_options')
    .select(`
      id,
      name,
      display_type,
      position,
      required,
      values:product_option_values(*)
    `)
    .eq('product_id', id)
    .order('position')

  // Récupérer les variantes relationnelles SKU du produit
  const { data: variantsData } = await supabase
    .from('product_variants')
    .select(`
      *,
      variant_values:product_variant_values(
        option_value:product_option_values(*)
      ),
      images:variant_images(*)
    `)
    .eq('product_id', id)

  const formattedVariants = (variantsData ?? []).map((v: any) => ({
    ...v,
    stock_quantity: v.stock_quantity ?? v.stock ?? 0,
    price: v.price ?? v.direct_price ?? product.price,
    option_values: v.variant_values?.map((vv: any) => vv.option_value).filter(Boolean) ?? [],
  }))

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <div className="mb-8">
        <Link
          href="/vendeur/produits"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-slate-500)] hover:text-[var(--color-navy-900)] transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Retour aux produits
        </Link>
        <h1 className="text-2xl font-bold text-[var(--color-navy-900)]">Modifier le produit</h1>
        <p className="text-sm text-[var(--color-slate-500)] mt-0.5">{product.name}</p>
      </div>

      <ProductForm
        storeId={store.id}
        categories={categories ?? []}
        initialData={product}
        initialOptions={(optionsData as any) ?? []}
        initialAdvancedVariants={formattedVariants as any}
        mode="edit"
      />
    </div>
  )
}
