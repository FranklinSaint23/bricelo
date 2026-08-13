'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { CategoryIcon } from '@/components/ui/category-icon'

interface Category {
  id: string
  name: string
  slug: string
  image_url: string | null
}

interface Props {
  categories: Category[]
  activeSlug?: string
}

export function CategoryBar({ categories, activeSlug }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' })
  }

  if (!categories.length) return null

  return (
    <div className="bg-white border-b border-[var(--color-slate-200)] sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 relative">

        <button onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-8 flex items-center justify-center bg-gradient-to-r from-white to-transparent text-[var(--color-slate-400)] hover:text-[var(--color-navy-900)]">
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div ref={scrollRef} className="flex items-center overflow-x-auto scrollbar-hide px-8 gap-1 py-1.5">
          <Link href="/catalogue"
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 transition-colors',
              !activeSlug
                ? 'bg-[var(--color-navy-900)] text-white'
                : 'text-[var(--color-slate-600)] hover:bg-[var(--color-slate-100)] hover:text-[var(--color-navy-900)]',
            )}>
            Tout voir
          </Link>

          {categories.map((cat) => {
            const isActive = cat.slug === activeSlug
            return (
              <Link key={cat.id} href={`/catalogue?categorie=${cat.slug}`}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 transition-colors',
                  isActive
                    ? 'bg-[var(--color-navy-900)] text-white'
                    : 'text-[var(--color-slate-600)] hover:bg-[var(--color-slate-100)] hover:text-[var(--color-navy-900)]',
                )}>
                <CategoryIcon slug={cat.slug} size="xs" className="shadow-none" />
                {cat.name}
              </Link>
            )
          })}
        </div>

        <button onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 w-8 flex items-center justify-center bg-gradient-to-l from-white to-transparent text-[var(--color-slate-400)] hover:text-[var(--color-navy-900)]">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
