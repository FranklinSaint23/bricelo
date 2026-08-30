import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductGallery } from '@/components/product/product-gallery'
import { AddToCartSection } from '@/components/product/add-to-cart-section'
import { ProductReviews } from '@/components/product/product-reviews'
import { WriteReviewForm } from '@/components/product/write-review-form'
import { TrackProductView } from '@/components/product/track-product-view'
import { ProductCard } from '@/components/product/product-card'
import { RecentlyViewed } from '@/components/home/recently-viewed'
import { VendorCtaBanner } from '@/components/common/vendor-cta-banner'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import { Star } from 'lucide-react'
import { PromoTimer } from '@/components/ui/promo-timer'
import Link from 'next/link'
import {
  ProductBreadcrumb,
  ProductCategoryBadge,
  ProductRatingLine,
  ProductStockStatus,
  ProductGuarantees,
  ProductStoreLink,
  ProductDescriptionHeading,
} from '@/components/product/product-page-client'

import { ProductDetailClient } from '@/components/product/product-detail-client'

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('name, description').eq('slug', slug).single()
  if (!data) return { title: 'Produit introuvable' }
  return { title: data.name, description: data.description?.slice(0, 160) }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      store:stores(id, name, slug, logo_url, rating, review_count, is_active),
      category:categories(id, name, slug)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
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
    .eq('product_id', product.id)
    .order('position')

  // Récupérer les variantes relationnelles SKU
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

  // Avis existant de l'utilisateur connecté
  const existingReview = authUser
    ? (reviews ?? []).find((r) => (r.user as any)?.id === authUser.id) ?? null
    : null

  const { data: related } = await supabase
    .from('products')
    .select('id, name, slug, price, compare_at_price, images, rating, review_count, store:stores(id, name, slug)')
    .eq('category_id', product.category_id)
    .eq('is_active', true)
    .neq('id', product.id)
    .limit(4)

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tracking produits récemment consultés */}
      <TrackProductView product={product} />

      {/* Breadcrumb */}
      <ProductBreadcrumb product={product as any} />

      {/* Composant Produit Client Réactif avec variantes */}
      <ProductDetailClient
        product={product}
        options={(optionsData as any) ?? []}
        variants={formattedVariants as any}
      />

      {/* Avis */}
      <ProductReviews reviews={reviews ?? []} rating={product.rating} count={product.review_count}>
        <WriteReviewForm
          productId={product.id}
          slug={slug}
          existingReview={existingReview ? { rating: existingReview.rating, comment: existingReview.comment } : null}
          defaultName={(authUser as any)?.user_metadata?.full_name ?? ''}
        />
      </ProductReviews>

      {/* Produits similaires */}
      {related && related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-[var(--color-navy-900)] mb-4">Produits similaires</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p as any} />)}
          </div>
        </section>
      )}
    </div>

    {/* Produits récemment consultés — hors du padding max-w */}
    <RecentlyViewed excludeId={product.id} />

    {/* Bannière devenir vendeur & tutoriels */}
    <VendorCtaBanner />
    </>
  )
}
