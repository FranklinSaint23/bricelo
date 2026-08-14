'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'
import { CATEGORY_SLUG_EN } from '@/lib/i18n/categories'

interface Category { id: string; name: string; slug: string }

interface FiltersProps {
  categories: Category[]
  currentCategory?: string
  currentMin?: string
  currentMax?: string
  currentTri?: string
}

export function CatalogueFilters({ categories, currentCategory, currentMin, currentMax, currentTri }: FiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang } = useLanguage()
  const fr = lang === 'fr'

  const update = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null) { params.delete(key) } else { params.set(key, value) }
    params.delete('page')
    router.push(`/catalogue?${params.toString()}`)
  }, [router, searchParams])

  const hasFilters = currentCategory || currentMin || currentMax || currentTri

  const SORT_OPTIONS = [
    { value: 'newest',     label: fr ? 'Plus récent'       : 'Most recent' },
    { value: 'price_asc',  label: fr ? 'Prix croissant'    : 'Price: low to high' },
    { value: 'price_desc', label: fr ? 'Prix décroissant'  : 'Price: high to low' },
    { value: 'popular',    label: fr ? 'Popularité'        : 'Popularity' },
    { value: 'relevance',  label: fr ? 'Pertinence'        : 'Relevance' },
  ]

  return (
    <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-slate-200)] p-4 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm text-[var(--color-navy-900)]">
          <SlidersHorizontal className="h-4 w-4" /> {fr ? 'Filtres' : 'Filters'}
        </div>
        {hasFilters && (
          <button onClick={() => router.push('/catalogue')} className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1">
            <X className="h-3 w-3" /> {fr ? 'Tout effacer' : 'Clear all'}
          </button>
        )}
      </div>

      {/* Catégorie */}
      <div>
        <p className="text-xs font-semibold text-[var(--color-slate-500)] uppercase tracking-wide mb-2">
          {fr ? 'Catégorie' : 'Category'}
        </p>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => update('categorie', null)}
            className={`text-left text-sm px-2 py-1.5 rounded-md transition-colors ${!currentCategory ? 'bg-[var(--color-navy-900)] text-white font-medium' : 'text-[var(--color-slate-700)] hover:bg-[var(--color-slate-100)]'}`}
          >
            {fr ? 'Toutes les catégories' : 'All categories'}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => update('categorie', cat.slug)}
              className={`text-left text-sm px-2 py-1.5 rounded-md transition-colors ${currentCategory === cat.slug ? 'bg-[var(--color-navy-900)] text-white font-medium' : 'text-[var(--color-slate-700)] hover:bg-[var(--color-slate-100)]'}`}
            >
              {lang === 'en' ? (CATEGORY_SLUG_EN[cat.slug] ?? cat.name) : cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Prix */}
      <div>
        <p className="text-xs font-semibold text-[var(--color-slate-500)] uppercase tracking-wide mb-2">
          {fr ? 'Prix (FCFA)' : 'Price (FCFA)'}
        </p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={currentMin}
            onBlur={(e) => update('min', e.target.value || null)}
            className="w-full h-8 px-2 text-sm border border-[var(--color-slate-200)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
          <input
            type="number"
            placeholder="Max"
            defaultValue={currentMax}
            onBlur={(e) => update('max', e.target.value || null)}
            className="w-full h-8 px-2 text-sm border border-[var(--color-slate-200)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>
      </div>

      {/* Tri */}
      <div>
        <p className="text-xs font-semibold text-[var(--color-slate-500)] uppercase tracking-wide mb-2">
          {fr ? 'Trier par' : 'Sort by'}
        </p>
        <div className="flex flex-col gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update('tri', opt.value)}
              className={`text-left text-sm px-2 py-1.5 rounded-md transition-colors ${currentTri === opt.value ? 'text-[var(--color-accent)] font-medium' : 'text-[var(--color-slate-700)] hover:bg-[var(--color-slate-100)]'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
