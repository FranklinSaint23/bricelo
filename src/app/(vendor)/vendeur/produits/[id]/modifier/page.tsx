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
    .select('*')
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

  const formattedOptions = (optionsData ?? []).map((opt: any) => ({
    id: opt.id,
    name: opt.name,
    display_type: opt.display_type || 'button',
    position: opt.position,
    required: opt.required ?? true,
    values: (opt.values ?? []).map((val: any) => ({
      id: val.id,
      value: val.value,
      label: val.label || val.value,
      position: val.position,
      is_active: val.is_active ?? true,
      metadata: val.metadata || null,
    })),
  }))

  const formattedVariants = (variantsData ?? []).map((v: any) => {
    const optionValues = (v.variant_values ?? []).map((vv: any) => {
      const ov = vv.option_value
      if (!ov) return null
      const parentOpt = (optionsData ?? []).find((o: any) => o.id === ov.product_option_id)
      return {
        id: ov.id,
        option_name: parentOpt?.name || 'Option',
        value: ov.value,
        label: ov.label || ov.value,
        metadata: ov.metadata || null,
      }
    }).filter(Boolean)

    const combinationKey = v.combination_key || (v.value && v.value !== 'defaut' ? v.value : optionValues.map((ov: any) => ov.value.toLowerCase().trim()).sort().join('|'))

    return {
      ...v,
      id: v.id,
      combination_key: combinationKey,
      stock_quantity: v.stock_quantity ?? v.stock ?? 0,
      price: (v.price && Number(v.price) > 0) ? Number(v.price) : (v.direct_price && Number(v.direct_price) > 0) ? Number(v.direct_price) : product.price,
      compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : null,
      sku: v.sku || '',
      description: v.description || '',
      status: v.status || 'active',
      option_values: optionValues,
      images: v.images || [],
    }
  })

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
        initialOptions={(formattedOptions as any) ?? []}
        initialAdvancedVariants={formattedVariants as any}
        mode="edit"
      />
    </div>
  )
}
