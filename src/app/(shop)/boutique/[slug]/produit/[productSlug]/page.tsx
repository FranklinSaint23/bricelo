import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductReviews } from '@/components/product/product-reviews'
import { WriteReviewForm } from '@/components/product/write-review-form'
import { TrackProductView } from '@/components/product/track-product-view'
import { ProductCard } from '@/components/product/product-card'
import { RecentlyViewed } from '@/components/home/recently-viewed'
import { VendorCtaBanner } from '@/components/common/vendor-cta-banner'
import { ProductDetailClient } from '@/components/product/product-detail-client'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ slug: string; productSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: storeSlug, productSlug } = await params
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('id, name, slug, logo_url')
    .eq('slug', storeSlug)
    .single()

  const { data: product } = await supabase
    .from('products')
    .select('name, description, images')
    .eq('slug', productSlug)
    .single()

  if (!product) return { title: 'Produit introuvable' }

  const storeName = store?.name ? ` | ${store.name}` : ''
  const title = `${product.name}${storeName} sur BRICÉLO`
  const description =
    product.description?.slice(0, 160) ||
    `Commandez ${product.name}${store?.name ? ` chez ${store.name}` : ''} sur Bricelo. Produits authentiques, livraison rapide et paiement sécurisé.`
  const images = product.images?.length
    ? product.images
    : store?.logo_url
    ? [store.logo_url]
    : ['/icons/icon-512x512.png']

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://bricelo.com/boutique/${storeSlug}/produit/${productSlug}`,
      siteName: 'BRICÉLO',
      images: images.map((url: string) => ({ url, width: 800, height: 800, alt: product.name })),
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
  }
}

export default async function BoutiqueProductPage({ params }: PageProps) {
  const { slug: storeSlug, productSlug } = await params
  const supabase = await createClient()

  // 1. Récupérer la boutique
  const { data: store } = await supabase
    .from('stores')
    .select('id, name, slug, logo_url, rating, review_count, is_active')
    .eq('slug', storeSlug)
    .single()

  // 2. Récupérer le produit (vérification d'appartenance à la boutique)
  let query = supabase
    .from('products')
    .select(`
      *,
      store:stores(id, name, slug, logo_url, rating, review_count, is_active),
      category:categories(id, name, slug)
    `)
    .eq('slug', productSlug)
    .eq('is_active', true)

  if (store?.id) {
    query = query.eq('store_id', store.id)
  }

  const { data: productData } = await query.maybeSingle()

  // Fallback si le produit a changé de boutique ou recherche générique par slug
  let product = productData
  if (!product) {
    const { data: fallbackProduct } = await supabase
      .from('products')
      .select(`
        *,
        store:stores(id, name, slug, logo_url, rating, review_count, is_active),
        category:categories(id, name, slug)
      `)
      .eq('slug', productSlug)
      .eq('is_active', true)
      .maybeSingle()

    product = fallbackProduct
  }

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
    .eq('product_id', product.id)
    .order('position')

  // Récupérer les variantes relationnelles
  const { data: variantsData } = await supabase
    .from('product_variants')
    .select(`
      *,
      variant_values:product_variant_values(
        option_value:product_option_values(*)
      ),
      images:variant_images(*)
    `)
    .eq('product_id', product.id)
    .order('created_at', { ascending: true })

  const sortedRawVariants = (variantsData ?? []).sort((a: any, b: any) => {
    if (a.created_at && b.created_at) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
    return String(a.id).localeCompare(String(b.id))
  })

  const formattedVariants = sortedRawVariants.map((v: any) => {
    const optionValues = (v.variant_values ?? []).map((vv: any) => {
      const ov = vv.option_value
      if (!ov) return null
      const parentOpt = (optionsData ?? []).find((o: any) => o.id === ov.product_option_id)
      return {
        id: ov.id,
        option_name: parentOpt?.name || 'Option',
        value: ov.value,
        label: ov.label || ov.value,
      }
    }).filter(Boolean)

    return {
      ...v,
      stock_quantity: v.stock_quantity ?? v.stock ?? 0,
      price: (v.price && Number(v.price) > 0) ? Number(v.price) : (v.direct_price && Number(v.direct_price) > 0) ? Number(v.direct_price) : product.price,
      compare_at_price: (v.compare_at_price && Number(v.compare_at_price) > 0)
        ? Number(v.compare_at_price)
        : (product.compare_at_price && Number(product.compare_at_price) > 0)
        ? Number(product.compare_at_price)
        : null,
      option_values: optionValues,
      images: v.images || [],
    }
  })

  const { data: { user: authUser } } = await supabase.auth.getUser()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, user:users(id, full_name, avatar_url)')
    .eq('product_id', product.id)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .limit(10)

  const existingReview = authUser
    ? (reviews ?? []).find((r) => (r.user as any)?.id === authUser.id) ?? null
    : null

  // Produits de la même boutique en priorité !
  const { data: storeProducts } = await supabase
    .from('products')
    .select('id, name, slug, price, compare_at_price, stock, product_type, promotion_label, is_new, promo_ends_at, images, rating, review_count, store:stores(id, name, slug), variants:product_variants(id, price, compare_at_price, stock_quantity, status, direct_price, price_adjustment, created_at, images:variant_images(url))')
    .eq('store_id', product.store_id)
    .eq('is_active', true)
    .neq('id', product.id)
    .limit(4)

  const effectiveTrackPrice = (product.price && Number(product.price) > 0)
    ? Number(product.price)
    : (formattedVariants[0]?.price && Number(formattedVariants[0].price) > 0)
    ? Number(formattedVariants[0].price)
    : 0

  const firstVarImages = formattedVariants.flatMap((v: any) => v.images || [])
  const firstVarImgObj = firstVarImages.find((img: any) => typeof img === 'string' || img?.url)
  const effectiveTrackImage = (Array.isArray(product.images) && product.images.length > 0)
    ? product.images[0]
    : (typeof firstVarImgObj === 'string' ? firstVarImgObj : (firstVarImgObj?.url || null))

  const trackableProduct = {
    ...product,
    price: effectiveTrackPrice,
    images: effectiveTrackImage ? [effectiveTrackImage] : [],
  }

  const effectiveStore = product.store || store

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tracking */}
        <TrackProductView product={trackableProduct} />

        {/* Fil d'ariane avec mise en valeur de la boutique */}
        <nav className="flex items-center gap-1.5 text-xs text-[var(--color-slate-400)] mb-6 flex-wrap">
          <Link href="/" className="hover:text-[var(--color-navy-900)] transition-colors">Accueil</Link>
          <span>/</span>
          {effectiveStore && (
            <>
              <Link href={`/boutique/${effectiveStore.slug}`} className="hover:text-[var(--color-navy-900)] font-semibold text-amber-600 transition-colors">
                Boutique {effectiveStore.name}
              </Link>
              <span>/</span>
            </>
          )}
          {product.category && (
            <>
              <Link href={`/catalogue?categorie=${product.category.slug}`} className="hover:text-[var(--color-navy-900)] transition-colors">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-[var(--color-navy-900)] font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Composant Produit Réactif */}
        <ProductDetailClient
          product={product}
          options={(optionsData as any) ?? []}
          variants={formattedVariants as any}
        />

        {/* Avis clients */}
        <ProductReviews reviews={reviews ?? []} rating={product.rating} count={product.review_count}>
          <WriteReviewForm
            productId={product.id}
            slug={productSlug}
            existingReview={existingReview ? { rating: existingReview.rating, comment: existingReview.comment } : null}
            defaultName={(authUser as any)?.user_metadata?.full_name ?? ''}
          />
        </ProductReviews>

        {/* Autres articles de cette boutique */}
        {storeProducts && storeProducts.length > 0 && (
          <section className="mt-12 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[var(--color-navy-900)]">
                Plus d&apos;articles chez <span className="text-amber-600">{effectiveStore?.name}</span>
              </h2>
              {effectiveStore && (
                <Link
                  href={`/boutique/${effectiveStore.slug}`}
                  className="text-xs font-bold text-slate-500 hover:text-[var(--color-accent)] transition-colors"
                >
                  Voir toute la boutique →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {storeProducts.map((p) => <ProductCard key={p.id} product={p as any} />)}
            </div>
          </section>
        )}
      </div>

      <RecentlyViewed excludeId={product.id} />
      <VendorCtaBanner />
    </>
  )
}
