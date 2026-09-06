'use client'

import { useState, useEffect } from 'react'
import { Timer } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  className?: string
  endsAt?: string | null
}

export function PromoTimer({ className, endsAt }: Props) {
  // S'il n'y a pas de date de fin spécifique saisie par l'utilisateur, le timer ne s'affiche pas
  if (!endsAt) return null

  const getEffectiveTargetTime = (endsAtStr: string): number | null => {
    const d = new Date(endsAtStr)
    if (isNaN(d.getTime())) return null

    const now = Date.now()
    let target = d.getTime()

    // Si la date est expirée, on la renouvelle automatiquement par cycles de 24h
    if (target <= now) {
      const cycleMs = 24 * 3600 * 1000 // 24 heures
      const elapsed = now - target
      const cycles = Math.floor(elapsed / cycleMs) + 1
      target = target + (cycles * cycleMs)
    }

    return target
  }

  const initialTarget = getEffectiveTargetTime(endsAt)
  if (!initialTarget) return null

  const [ms, setMs] = useState(() => Math.max(0, initialTarget - Date.now()))

  useEffect(() => {
    const tick = () => {
      const targetTime = getEffectiveTargetTime(endsAt)
      if (targetTime) {
        setMs(Math.max(0, targetTime - Date.now()))
      }
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endsAt])

  const d   = Math.floor(ms / 86_400_000)
  const h   = Math.floor((ms % 86_400_000) / 3_600_000)
  const m   = Math.floor((ms % 3_600_000) / 60_000)
  const s   = Math.floor((ms % 60_000) / 1_000)
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className={cn('bg-red-50/95 dark:bg-red-950/50 border border-red-200/90 dark:border-red-800/70 rounded-xl p-1.5 sm:p-2 flex flex-col gap-1 w-full max-w-full overflow-hidden shadow-2xs', className)}>
      <div className="flex items-center gap-1 shrink-0">
        <Timer className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-600 dark:text-red-400 shrink-0 animate-pulse" />
        <span className="text-[9px] sm:text-xs font-black text-red-700 dark:text-red-300 uppercase tracking-tight truncate">
          Fin de promo dans :
        </span>
      </div>
      <div className="flex items-center gap-0.5 sm:gap-1 font-mono text-[9px] sm:text-xs font-bold shrink-0 flex-wrap">
        {d > 0 && (
          <>
            <span className="bg-red-600 text-white px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-xs font-black shrink-0">{d}j</span>
            <span className="text-red-500 font-black text-[9px] sm:text-xs shrink-0">:</span>
          </>
        )}
        <span className="bg-[var(--color-navy-900)] dark:bg-slate-800 text-white px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-xs font-bold shrink-0">{pad(h)}h</span>
        <span className="text-[var(--color-slate-400)] font-black text-[9px] sm:text-xs shrink-0">:</span>
        <span className="bg-[var(--color-navy-900)] dark:bg-slate-800 text-white px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-xs font-bold shrink-0">{pad(m)}m</span>
        <span className="text-[var(--color-slate-400)] font-black text-[9px] sm:text-xs shrink-0">:</span>
        <span className="bg-red-600 text-white px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-xs font-black shrink-0 animate-pulse">{pad(s)}s</span>
      </div>
    </div>
  )
}
