'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '@/components/product/product-card'
import { FeaturedBannerMobile } from './featured-banner'
import { useLanguage } from '@/components/providers/language-provider'
import type { Product } from '@/types'
import { VendorCtaBanner } from '@/components/common/vendor-cta-banner'

type P = Product & { promotion_label?: string | null; is_new?: boolean }

interface Props {
  featuredProducts?: P[]
  allProducts: P[]
  promoProducts?: P[]
}

function SectionHeader({
  title,
  href,
  badge,
  showLink = true,
}: {
  title: string
  href?: string
  badge?: { label: string; color: 'red' | 'gold' }
  showLink?: boolean
}) {
  const { t } = useLanguage()
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <h2 className="text-lg font-bold text-[var(--color-navy-900)]">{title}</h2>
        {badge && (
          <span
            className={
              badge.color === 'red'
                ? 'text-[11px] font-bold px-2 py-0.5 rounded bg-[var(--color-danger)] text-white tracking-wide'
                : 'text-[11px] font-bold px-2 py-0.5 rounded bg-[var(--color-accent)] text-[var(--color-navy-900)] tracking-wide'
            }
          >
            {badge.label}
          </span>
        )}
      </div>

      {showLink && href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm text-[var(--color-slate-500)] hover:text-[var(--color-accent)] transition-colors"
        >
          {t.seeAll} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  )
}

function ProductGrid({ products, cols = 5 }: { products: P[]; cols?: number }) {
  const gridClass = cols === 5
    ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'
    : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'
  return (
    <div className={gridClass}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}

export function HomeProducts({ featuredProducts = [], allProducts = [], promoProducts = [] }: Props) {
  const { t } = useLanguage()

  // Regroupement automatique de tous les produits par catégorie pour les rayons
  const { groups, uncategorized } = useMemo(() => {
    const groupsMap = new Map<string, { id: string; name: string; slug: string; products: P[] }>()
    const uncategorizedList: P[] = []

    allProducts.forEach((p) => {
      const cat = p.category as any
      const catId = p.category_id || cat?.id
      const catName = cat?.name
      const catSlug = cat?.slug || ''

      if (catId && catName) {
        if (!groupsMap.has(catId)) {
          groupsMap.set(catId, {
            id: catId,
            name: catName,
            slug: catSlug,
            products: [],
          })
        }
        groupsMap.get(catId)!.products.push(p)
      } else {
        uncategorizedList.push(p)
      }
    })

    const groupList = Array.from(groupsMap.values())
    // Trier les rayons par nombre de produits décroissant (avec bris d'égalité déterministe sur le nom)
    groupList.sort((a, b) => (b.products.length - a.products.length) || a.name.localeCompare(b.name))

    return { groups: groupList, uncategorized: uncategorizedList }
  }, [allProducts])

  return (
    <div className="flex flex-col gap-10">
      {/* ── 1. OFFRES DU MOMENT (PROMOS DU JOUR) ── */}
      {promoProducts && promoProducts.length > 0 && (
        <section>
          <SectionHeader
            title={t.offersOfTheDay}
            href="/catalogue"
            badge={{ label: 'PROMO', color: 'red' }}
            showLink={true}
          />
          <ProductGrid products={promoProducts} cols={4} />
        </section>
      )}

      {/* ── 2. PRODUITS VEDETTES (SELECTION DU MOMENT) ── */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section>
          <SectionHeader
            title={t.featuredProductsTitle}
            href="/catalogue"
            badge={{ label: 'TOP', color: 'gold' }}
            showLink={true}
          />
          <FeaturedBannerMobile products={featuredProducts} />
          <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── 3. TOUS LES PRODUITS AVEC SES RAYONS EN DESSOUS ── */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-navy-900)]">
            {t.allProducts}
          </h2>
        </div>

        {allProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center bg-white rounded-2xl border border-dashed border-[var(--color-slate-300)]">
            <p className="text-base font-semibold text-[var(--color-navy-900)]">{t.noProductsAvailable}</p>
            <p className="text-sm text-[var(--color-slate-500)] max-w-sm">
              {t.noProductsAvailableSub}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {groups.map((group) => (
              <div key={group.id} className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-[var(--color-navy-900)]">
                    {group.name}
                  </h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[var(--color-accent)] text-[var(--color-navy-900)] tracking-wide shrink-0">
                    {group.products.length} article{group.products.length > 1 ? 's' : ''}
                  </span>
                </div>
                {/* Grille continue : les produits remplissent la ligne et passent directement en bas sans s'arrêter */}
                <ProductGrid products={group.products} cols={5} />
              </div>
            ))}

            {/* Si certains produits n'ont pas encore de catégorie attribuée */}
            {uncategorized.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-[var(--color-navy-900)]">
                    Autres articles
                  </h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[var(--color-accent)] text-[var(--color-navy-900)] tracking-wide shrink-0">
                    {uncategorized.length} article{uncategorized.length > 1 ? 's' : ''}
                  </span>
                </div>
                <ProductGrid products={uncategorized} cols={5} />
              </div>
            )}
          </div>
        )}
      </section>

      <VendorCtaBanner />
    </div>
  )
}
