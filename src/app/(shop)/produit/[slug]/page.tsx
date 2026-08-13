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
import { Avatar } from '@/components/ui/avatar'
import { formatPrice, formatDate } from '@/lib/utils'
import { Star, Store, ShieldCheck, Truck, BadgeCheck, Headphones, RefreshCw } from 'lucide-react'
import { PromoTimer } from '@/components/ui/promo-timer'
import Link from 'next/link'

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
      <nav className="flex items-center gap-2 text-sm text-[var(--color-slate-500)] mb-6">
        <Link href="/" className="hover:text-[var(--color-accent)]">Accueil</Link>
        <span>/</span>
        <Link href="/catalogue" className="hover:text-[var(--color-accent)]">Catalogue</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/catalogue?categorie=${product.category.slug}`} className="hover:text-[var(--color-accent)]">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-[var(--color-navy-900)] truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Produit principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-[var(--radius-2xl)] p-6 sm:p-8 border border-[var(--color-slate-200)]">
        <ProductGallery images={product.images} name={product.name} />

        <div className="flex flex-col gap-5">
          {/* En-tête */}
          <div>
            {product.category && (
              <Link href={`/catalogue?categorie=${product.category.slug}`}>
                <Badge variant="default" className="mb-2">{product.category.name}</Badge>
              </Link>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-navy-900)] leading-tight">{product.name}</h1>

            {/* Note */}
            {product.review_count > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`h-4 w-4 ${s <= Math.round(product.rating) ? 'fill-[var(--color-accent)] text-[var(--color-accent)]' : 'text-[var(--color-slate-300)]'}`} />
                  ))}
                </div>
                <span className="text-sm text-[var(--color-slate-500)]">{product.rating.toFixed(1)} ({product.review_count} avis)</span>
              </div>
            )}
          </div>

          {/* Prix */}
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-[var(--color-navy-900)]">{formatPrice(product.price)}</span>
              {product.compare_at_price && (
                <>
                  <span className="text-lg text-[var(--color-slate-400)] line-through">{formatPrice(product.compare_at_price)}</span>
                  <Badge variant="danger">-{discount}%</Badge>
                </>
              )}
            </div>
            {product.compare_at_price && <PromoTimer endsAt={product.promo_ends_at} />}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            {product.stock > 0
              ? <span className="text-green-600 font-medium">✓ En stock ({product.stock} disponible{product.stock > 1 ? 's' : ''})</span>
              : <span className="text-[var(--color-danger)] font-medium">✗ Rupture de stock</span>
            }
          </div>

          {/* Add to cart */}
          <AddToCartSection product={product as any} />

          {/* Garanties */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            {[
              { icon: ShieldCheck,  label: 'Paiement sécurisé',      sub: 'Via CinetPay' },
              { icon: Truck,        label: 'Livraison à partir de 3h', sub: 'Douala & Yaoundé' },
              { icon: BadgeCheck,   label: 'Produits authentiques',   sub: '100% garantis' },
              { icon: Headphones,   label: 'Service après-vente',     sub: 'Bricelo SAV Agréé' },
              { icon: RefreshCw,    label: 'Retour facile',           sub: 'Sous 7 jours' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-2 bg-[var(--color-slate-50)] rounded-[var(--radius-lg)] p-2.5">
                <Icon className="h-4 w-4 text-[var(--color-accent)] shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold text-[var(--color-navy-900)] leading-tight">{label}</p>
                  <p className="text-[10px] text-[var(--color-slate-500)]">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Vendeur */}
          {product.store && (
            <Link href={`/boutique/${product.store.slug}`}
              className="flex items-center gap-3 p-3 bg-[var(--color-slate-50)] rounded-[var(--radius-lg)] hover:bg-[var(--color-slate-100)] transition-colors border border-[var(--color-slate-200)]">
              <Avatar src={product.store.logo_url} name={product.store.name} size="md" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--color-navy-900)]">{product.store.name}</p>
                {product.store.review_count > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 fill-[var(--color-accent)] text-[var(--color-accent)]" />
                    <span className="text-xs text-[var(--color-slate-500)]">{product.store.rating.toFixed(1)} ({product.store.review_count} avis)</span>
                  </div>
                )}
              </div>
              <Store className="h-4 w-4 text-[var(--color-slate-400)]" />
            </Link>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-8 bg-white rounded-[var(--radius-2xl)] p-6 sm:p-8 border border-[var(--color-slate-200)]">
          <h2 className="text-lg font-bold text-[var(--color-navy-900)] mb-4">Description</h2>
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
