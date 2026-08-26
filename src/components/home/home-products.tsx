'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '@/components/product/product-card'
import { FeaturedBannerMobile } from './featured-banner'
import { useLanguage } from '@/components/providers/language-provider'
import type { Product } from '@/types'

type P = Product & { promotion_label?: string | null; is_new?: boolean }

interface Props {
  featuredProducts: P[]
  allProducts: P[]
  promoProducts: P[]
}

function SectionHeader({ title, href, badge }: { title: string; href: string; badge?: { label: string; color: 'red' | 'gold' } }) {
  const { t } = useLanguage()
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <h2 className="text-lg font-bold text-[var(--color-navy-900)]">{title}</h2>
        {badge && (
          <span className={
            badge.color === 'red'
              ? 'text-[11px] font-bold px-2 py-0.5 rounded bg-[var(--color-danger)] text-white tracking-wide'
              : 'text-[11px] font-bold px-2 py-0.5 rounded bg-[var(--color-accent)] text-[var(--color-navy-900)] tracking-wide'
          }>
            {badge.label}
          </span>
        )}
      </div>
      <Link href={href} className="flex items-center gap-1 text-sm text-[var(--color-slate-500)] hover:text-[var(--color-accent)] transition-colors">
        {t.seeAll} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}

function ProductGrid({ products, cols = 5 }: { products: P[]; cols?: number }) {
  const gridClass = cols === 5
    ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'
    : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'
  return (
    <div className={gridClass}>
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}

export function HomeProducts({ featuredProducts, allProducts, promoProducts }: Props) {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col gap-10">

      {promoProducts.length > 0 && (
        <section>
          <SectionHeader title={t.offersOfTheDay} href="/catalogue" badge={{ label: 'PROMO', color: 'red' }} />
          <ProductGrid products={promoProducts} cols={4} />
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section>
          <SectionHeader title={t.featuredProductsTitle} href="/catalogue" badge={{ label: 'TOP', color: 'gold' }} />
          <FeaturedBannerMobile products={featuredProducts} />
          <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title={t.allProducts} href="/catalogue" />

        {allProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center bg-white rounded-2xl border border-dashed border-[var(--color-slate-300)]">
            <p className="text-base font-semibold text-[var(--color-navy-900)]">{t.noProductsAvailable}</p>
            <p className="text-sm text-[var(--color-slate-500)] max-w-sm">
              {t.noProductsAvailableSub}
            </p>
          </div>
        ) : (
          <>
            <ProductGrid products={allProducts} cols={5} />
            {allProducts.length >= 40 && (
              <div className="mt-8 text-center">
                <Link href="/catalogue"
                  className="inline-flex items-center gap-2 h-11 px-8 rounded-lg border border-[var(--color-slate-300)] text-sm font-semibold text-[var(--color-navy-900)] hover:border-[var(--color-navy-900)] hover:bg-[var(--color-slate-50)] transition-colors">
                  {t.seeAllProducts} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      <div className="rounded-xl bg-[var(--color-navy-900)] px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-white font-bold">{t.sellerCta}</p>
          <p className="text-white/50 text-sm mt-0.5">{t.sellerCtaSub}</p>
        </div>
        <Link href="/devenir-vendeur"
          className="shrink-0 h-10 px-5 rounded-lg bg-[var(--color-accent)] text-[var(--color-navy-900)] font-bold text-sm hover:bg-[var(--color-gold-400)] transition-colors">
          {t.openStore}
        </Link>
      </div>

    </div>
  )
}
