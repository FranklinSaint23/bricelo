'use client'

import Link from 'next/link'
import { Star, Store, ShieldCheck, Truck, BadgeCheck, Headphones, RefreshCw } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { PromoTimer } from '@/components/ui/promo-timer'
import { formatPrice } from '@/lib/utils'
import { useLanguage } from '@/components/providers/language-provider'
import { CATEGORY_SLUG_EN } from '@/lib/i18n/categories'

interface ProductClientProps {
  product: {
    name: string
    price: number
    compare_at_price?: number | null
    promo_ends_at?: string | null
    stock: number
    rating: number
    review_count: number
    description?: string | null
    store?: { name: string; slug: string; logo_url?: string | null; rating: number; review_count: number } | null
    category?: { name: string; slug: string } | null
  }
  discount: number
}

export function ProductBreadcrumb({ product }: { product: ProductClientProps['product'] }) {
  const { lang } = useLanguage()
  const fr = lang === 'fr'
  const catName = product.category
    ? (lang === 'en' ? (CATEGORY_SLUG_EN[product.category.slug] ?? product.category.name) : product.category.name)
    : null

  return (
    <nav className="flex items-center gap-2 text-sm text-[var(--color-slate-500)] mb-6">
      <Link href="/" className="hover:text-[var(--color-accent)]">{fr ? 'Accueil' : 'Home'}</Link>
      <span>/</span>
      <Link href="/catalogue" className="hover:text-[var(--color-accent)]">{fr ? 'Catalogue' : 'Catalogue'}</Link>
      {catName && (
        <>
          <span>/</span>
          <Link href={`/catalogue?categorie=${product.category!.slug}`} className="hover:text-[var(--color-accent)]">
            {catName}
          </Link>
        </>
      )}
      <span>/</span>
      <span className="text-[var(--color-navy-900)] truncate max-w-[200px]">{product.name}</span>
    </nav>
  )
}

export function ProductCategoryBadge({ category }: { category: { name: string; slug: string } }) {
  const { lang } = useLanguage()
  const name = lang === 'en' ? (CATEGORY_SLUG_EN[category.slug] ?? category.name) : category.name
  return (
    <Link href={`/catalogue?categorie=${category.slug}`}>
      <Badge variant="default" className="mb-2">{name}</Badge>
    </Link>
  )
}

export function ProductRatingLine({ rating, count }: { rating: number; count: number }) {
  const { lang } = useLanguage()
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map((s) => (
          <Star key={s} className={`h-4 w-4 ${s <= Math.round(rating) ? 'fill-[var(--color-accent)] text-[var(--color-accent)]' : 'text-[var(--color-slate-300)]'}`} />
        ))}
      </div>
      <span className="text-sm text-[var(--color-slate-500)]">
        {rating.toFixed(1)} ({count} {lang === 'fr' ? 'avis' : 'reviews'})
      </span>
    </div>
  )
}

export function ProductStockStatus({ stock }: { stock: number }) {
  const { lang } = useLanguage()
  const fr = lang === 'fr'
  if (stock > 0) {
    return (
      <span className="text-green-600 font-medium">
        ✓ {fr ? `En stock (${stock} disponible${stock > 1 ? 's' : ''})` : `In stock (${stock} available)`}
      </span>
    )
  }
  return (
    <span className="text-[var(--color-danger)] font-medium">
      ✗ {fr ? 'Rupture de stock' : 'Out of stock'}
    </span>
  )
}

export function ProductGuarantees() {
  const { lang } = useLanguage()
  const fr = lang === 'fr'

  const items = [
    { icon: ShieldCheck, label: fr ? 'Paiement sécurisé'      : 'Secure payment',   sub: 'CinetPay' },
    { icon: Truck,       label: fr ? 'Livraison à partir de 3h': 'From 3h delivery', sub: 'Douala & Yaoundé' },
    { icon: BadgeCheck,  label: fr ? 'Produits authentiques'   : 'Authentic products', sub: fr ? '100% garantis' : '100% guaranteed' },
    { icon: Headphones,  label: fr ? 'Service après-vente'     : 'After-sales service', sub: 'Bricelo SAV' },
    { icon: RefreshCw,   label: fr ? 'Retour facile'           : 'Easy returns',     sub: fr ? 'Sous 7 jours' : 'Within 7 days' },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 pt-2">
      {items.map(({ icon: Icon, label, sub }) => (
        <div key={label} className="flex items-center gap-2 bg-[var(--color-slate-50)] rounded-[var(--radius-lg)] p-2.5">
          <Icon className="h-4 w-4 text-[var(--color-accent)] shrink-0" />
          <div>
            <p className="text-[11px] font-semibold text-[var(--color-navy-900)] leading-tight">{label}</p>
            <p className="text-[10px] text-[var(--color-slate-500)]">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProductStoreLink({ store }: { store: NonNullable<ProductClientProps['product']['store']> }) {
  const { lang } = useLanguage()
  return (
    <Link href={`/boutique/${store.slug}`}
      className="flex items-center gap-3 p-3 bg-[var(--color-slate-50)] rounded-[var(--radius-lg)] hover:bg-[var(--color-slate-100)] transition-colors border border-[var(--color-slate-200)]">
      <Avatar src={store.logo_url} name={store.name} size="md" />
      <div className="flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-bold text-[var(--color-navy-900)]">{store.name}</p>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500/10 text-sky-600 border border-sky-500/20 shadow-2xs">
            <BadgeCheck className="h-3.5 w-3.5 text-sky-500 fill-sky-100 shrink-0" />
            <span>Vendeur certifié</span>
          </span>
        </div>
        {store.review_count > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-3 w-3 fill-[var(--color-accent)] text-[var(--color-accent)]" />
            <span className="text-xs text-[var(--color-slate-500)]">
              {store.rating.toFixed(1)} ({store.review_count} {lang === 'fr' ? 'avis' : 'reviews'})
            </span>
          </div>
        )}
      </div>
      <Store className="h-4 w-4 text-[var(--color-slate-400)]" />
    </Link>
  )
}

export function ProductDescriptionHeading() {
  const { lang } = useLanguage()
  return (
    <h2 className="text-lg font-bold text-[var(--color-navy-900)] mb-4">
      {lang === 'fr' ? 'Description' : 'Description'}
    </h2>
  )
}
