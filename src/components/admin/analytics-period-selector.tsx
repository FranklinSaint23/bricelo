'use client'

import Link from 'next/link'
import { Calendar, Clock, ChevronDown } from 'lucide-react'

export type PeriodType = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'all'

interface Props {
  currentPeriod: PeriodType
}

export const PERIODS: Array<{ id: PeriodType; label: string; shortLabel: string; desc: string }> = [
  { id: 'today', label: "Aujourd'hui", shortLabel: "Aujourd'hui", desc: 'Depuis minuit' },
  { id: 'yesterday', label: 'Hier', shortLabel: 'Hier', desc: 'Journée précédente' },
  { id: 'week', label: 'Hebdomadaire (7j)', shortLabel: '7 Jours', desc: '7 derniers jours' },
  { id: 'month', label: 'Mensuelle (30j)', shortLabel: '30 Jours', desc: '30 derniers jours' },
  { id: 'year', label: 'Annuelle (1 an)', shortLabel: 'Année', desc: 'Année en cours' },
  { id: 'all', label: 'Tout l’historique', shortLabel: 'Tout', desc: 'Cumul complet' },
]

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
