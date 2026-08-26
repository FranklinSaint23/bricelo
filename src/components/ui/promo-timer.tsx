'use client'

import { useState, useEffect } from 'react'
import { Timer, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  className?: string
  endsAt?: string | null
}

function calcTarget(endsAt?: string | null): { target: Date; isDaily: boolean } {
  if (endsAt) {
    const d = new Date(endsAt)
    if (!isNaN(d.getTime())) {
      return { target: d, isDaily: false }
    }
  }

  // Si l'utilisateur n'a pas mis de date de fin spécifique :
  // Décompte automatique quotidien jusqu'à minuit (23:59:59) qui se réinitialise seul chaque jour !
  const midnight = new Date()
  midnight.setHours(23, 59, 59, 999)
  return { target: midnight, isDaily: true }
}

export function PromoTimer({ className, endsAt }: Props) {
  const [{ target, isDaily }, setTargetInfo] = useState(() => calcTarget(endsAt))
  const [ms, setMs] = useState(() => target.getTime() - Date.now())

  useEffect(() => {
    const info = calcTarget(endsAt)
    setTargetInfo(info)

    const tick = () => {
      const remaining = info.target.getTime() - Date.now()
      if (remaining <= 0) {
        if (info.isDaily) {
          // Réinitialiser automatiquement pour le jour suivant à minuit
          const nextMidnight = new Date()
          nextMidnight.setHours(23, 59, 59, 999)
          setTargetInfo({ target: nextMidnight, isDaily: true })
          setMs(nextMidnight.getTime() - Date.now())
        } else {
          setMs(0)
        }
      } else {
        setMs(remaining)
      }
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endsAt])

  // Si la date limite spécifiée par le vendeur est expirée
  if (!isDaily && ms <= 0) {
    return (
      <div className={cn('bg-slate-100 border border-slate-200 rounded-lg p-2 flex items-center justify-between text-xs text-slate-600 font-semibold', className)}>
        <span className="flex items-center gap-1.5 text-slate-700">
          <AlertCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          Offre promotionnelle expirée
        </span>
        <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded font-bold text-slate-500">Expiré</span>
      </div>
    )
  }

  const safeMs = Math.max(0, ms)
  const d   = Math.floor(safeMs / 86_400_000)
  const h   = Math.floor((safeMs % 86_400_000) / 3_600_000)
  const m   = Math.floor((safeMs % 3_600_000) / 60_000)
  const s   = Math.floor((safeMs % 60_000) / 1_000)
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className={cn('bg-red-50/90 border border-red-200/80 rounded-lg p-2 flex flex-col gap-1 w-full max-w-full overflow-hidden shadow-2xs', className)}>
      <div className="flex items-center gap-1 shrink-0">
        <Timer className="h-3.5 w-3.5 text-red-600 shrink-0 animate-pulse" />
        <span className="text-[10px] sm:text-xs font-extrabold text-red-700 uppercase tracking-tight whitespace-nowrap">
          {isDaily ? 'Vente Flash du jour :' : 'Fin de promo dans :'}
        </span>
      </div>
      <div className="flex items-center gap-1 font-mono text-[10px] sm:text-xs font-bold shrink-0">
        {d > 0 && (
          <>
            <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-black">{d}j</span>
            <span className="text-red-500 font-extrabold">:</span>
          </>
        )}
        <span className="bg-[var(--color-navy-900)] text-white px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-bold">{pad(h)}h</span>
        <span className="text-[var(--color-slate-400)] font-extrabold">:</span>
        <span className="bg-[var(--color-navy-900)] text-white px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-bold">{pad(m)}m</span>
        <span className="text-[var(--color-slate-400)] font-extrabold">:</span>
        <span className="bg-[var(--color-navy-900)] text-white px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-bold">{pad(s)}s</span>
      </div>
    </div>
  )
}
