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
      category:categories(id, name, slug),
      variants:product_variants(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

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

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tracking produits récemment consultés */}
      <TrackProductView product={product} />

      {/* Breadcrumb */}
      <ProductBreadcrumb product={product as any} />

      {/* Produit principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-[var(--radius-2xl)] p-6 sm:p-8 border border-[var(--color-slate-200)]">
        <ProductGallery images={product.images} name={product.name} />

        <div className="flex flex-col gap-5">
          {/* En-tête */}
          <div>
            {product.category && <ProductCategoryBadge category={product.category as any} />}
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-navy-900)] leading-tight">{product.name}</h1>
            {product.review_count > 0 && (
              <ProductRatingLine rating={product.rating} count={product.review_count} />
            )}
          </div>

          {/* Prix */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center flex-wrap gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl font-extrabold text-[var(--color-navy-900)]">
                {formatPrice(product.price)}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <>
                  <span className="text-xl sm:text-2xl font-extrabold text-[var(--color-slate-400)] line-through">
                    {formatPrice(product.compare_at_price)}
                  </span>
                  <Badge variant="danger" className="shrink-0 text-xs font-bold px-2 py-0.5">
                    -{discount}%
                  </Badge>
                </>
              )}
            </div>
            {product.compare_at_price && <PromoTimer endsAt={product.promo_ends_at} />}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            <ProductStockStatus stock={product.stock} />
          </div>

          {/* Add to cart */}
          <AddToCartSection product={product as any} />

          {/* Garanties */}
          <ProductGuarantees />

          {/* Vendeur */}
          {product.store && <ProductStoreLink store={product.store as any} />}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-8 bg-white rounded-[var(--radius-2xl)] p-6 sm:p-8 border border-[var(--color-slate-200)]">
          <ProductDescriptionHeading />
          <div className="prose prose-sm max-w-none text-[var(--color-slate-700)] leading-relaxed whitespace-pre-line">
            {product.description}
          </div>
        </div>
      )}

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
    </>
  )
}
