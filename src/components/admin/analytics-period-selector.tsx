'use client'

import Link from 'next/link'
import { PERIODS, type PeriodType } from '@/lib/analytics-constants'

export type { PeriodType }
export { PERIODS }

interface Props {
  currentPeriod: PeriodType
}

export function AnalyticsPeriodSelector({ currentPeriod }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs shadow-2xs">
      {PERIODS.map((p) => {
        const isActive = currentPeriod === p.id
        return (
          <Link
            key={p.id}
            href={`/admin/analytics?period=${p.id}`}
            scroll={false}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              isActive
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50'
            }`}
            title={p.desc}
          >
            <span className="sm:inline hidden">{p.label}</span>
            <span className="sm:hidden inline">{p.shortLabel}</span>
          </Link>
        )
      })}
    </div>
  )
}
