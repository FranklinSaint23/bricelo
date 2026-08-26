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

  const targetDate = new Date(endsAt)
  if (isNaN(targetDate.getTime())) return null

  const [ms, setMs] = useState(() => Math.max(0, targetDate.getTime() - Date.now()))

  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, targetDate.getTime() - Date.now())
      setMs(remaining)
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endsAt])

  // Dès que le décompte spécifié par l'utilisateur expire (atteint 0), le timer disparaît totalement
  if (ms <= 0) return null

  const d   = Math.floor(ms / 86_400_000)
  const h   = Math.floor((ms % 86_400_000) / 3_600_000)
  const m   = Math.floor((ms % 3_600_000) / 60_000)
  const s   = Math.floor((ms % 60_000) / 1_000)
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className={cn('bg-red-50/90 border border-red-200/80 rounded-lg p-2 flex flex-col gap-1 w-full max-w-full overflow-hidden shadow-2xs', className)}>
      <div className="flex items-center gap-1 shrink-0">
        <Timer className="h-3.5 w-3.5 text-red-600 shrink-0 animate-pulse" />
        <span className="text-[10px] sm:text-xs font-extrabold text-red-700 uppercase tracking-tight whitespace-nowrap">
          Fin de promo dans :
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
