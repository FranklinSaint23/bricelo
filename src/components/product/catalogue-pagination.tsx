'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props { currentPage: number; totalPages: number }

export function CataloguePagination({ currentPage, totalPages }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function goTo(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`/catalogue?${params.toString()}`)
  }

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1
    if (currentPage <= 4) return i + 1
    if (currentPage >= totalPages - 3) return totalPages - 6 + i
    return currentPage - 3 + i
  })

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage <= 1}
        className="h-9 w-9 flex items-center justify-center rounded-md border border-[var(--color-slate-200)] hover:bg-[var(--color-slate-100)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => goTo(p)}
          className={cn(
            'h-9 w-9 flex items-center justify-center rounded-md text-sm transition-colors',
            p === currentPage
              ? 'bg-[var(--color-navy-900)] text-white font-semibold'
              : 'border border-[var(--color-slate-200)] hover:bg-[var(--color-slate-100)] text-[var(--color-slate-700)]',
          )}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="h-9 w-9 flex items-center justify-center rounded-md border border-[var(--color-slate-200)] hover:bg-[var(--color-slate-100)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
