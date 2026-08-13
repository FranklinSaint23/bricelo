'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  currentPage: number
  totalPages: number
  q: string
  tri: string
}

export function SearchPagination({ currentPage, totalPages, q, tri }: Props) {
  function href(page: number) {
    return `/recherche?q=${encodeURIComponent(q)}&tri=${tri}&page=${page}`
  }

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1
    if (currentPage <= 4) return i + 1
    if (currentPage >= totalPages - 3) return totalPages - 6 + i
    return currentPage - 3 + i
  })

  return (
    <div className="flex items-center justify-center gap-1">
      <Link
        href={href(currentPage - 1)}
        aria-disabled={currentPage <= 1}
        className={cn(
          'h-9 w-9 flex items-center justify-center rounded-md border border-[var(--color-slate-200)] hover:bg-[var(--color-slate-100)] transition-colors',
          currentPage <= 1 && 'opacity-40 pointer-events-none',
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          className={cn(
            'h-9 w-9 flex items-center justify-center rounded-md text-sm transition-colors',
            p === currentPage
              ? 'bg-[var(--color-navy-900)] text-white font-semibold'
              : 'border border-[var(--color-slate-200)] hover:bg-[var(--color-slate-100)] text-[var(--color-slate-700)]',
          )}
        >
          {p}
        </Link>
      ))}

      <Link
        href={href(currentPage + 1)}
        aria-disabled={currentPage >= totalPages}
        className={cn(
          'h-9 w-9 flex items-center justify-center rounded-md border border-[var(--color-slate-200)] hover:bg-[var(--color-slate-100)] transition-colors',
          currentPage >= totalPages && 'opacity-40 pointer-events-none',
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
