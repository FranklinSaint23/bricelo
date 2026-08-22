'use client'

import { useState, useEffect } from 'react'
import { Timer } from 'lucide-react'
import { cn } from '@/lib/utils'

function getTarget(endsAt?: string | null): Date {
  if (endsAt) {
    const d = new Date(endsAt)
    if (!isNaN(d.getTime()) && d > new Date()) return d
  }
  // Fallback : 5 jours, 5 heures, 5 minutes à partir de maintenant
  const defaultTarget = new Date(Date.now() + (5 * 86400 + 5 * 3600 + 5 * 60 + 5) * 1000)
  return defaultTarget
}

interface Props { className?: string; endsAt?: string | null }

export function PromoTimer({ className, endsAt }: Props) {
  const [ms, setMs] = useState(() => Math.max(0, getTarget(endsAt).getTime() - Date.now()))

  useEffect(() => {
    const target = getTarget(endsAt)
    const tick = () => setMs(Math.max(0, target.getTime() - Date.now()))
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
    <div className={cn('flex items-center gap-2 flex-wrap bg-red-50/80 border border-red-200/60 p-2 rounded-xl', className)}>
      <Timer className="h-4 w-4 text-red-600 shrink-0 animate-pulse" />
      <span className="text-xs font-bold text-red-700 uppercase tracking-wide">
        Offre limitée :
      </span>
      <div className="flex items-center gap-1 font-mono text-xs font-bold">
        <span className="bg-red-600 text-white px-1.5 py-0.5 rounded shadow-xs">{d}J</span>
        <span className="text-red-500 font-extrabold">:</span>
        <span className="bg-[var(--color-navy-900)] text-white px-1.5 py-0.5 rounded shadow-xs">{pad(h)}H</span>
        <span className="text-[var(--color-slate-400)] font-extrabold">:</span>
        <span className="bg-[var(--color-navy-900)] text-white px-1.5 py-0.5 rounded shadow-xs">{pad(m)}M</span>
        <span className="text-[var(--color-slate-400)] font-extrabold">:</span>
        <span className="bg-[var(--color-navy-900)] text-white px-1.5 py-0.5 rounded shadow-xs">{pad(s)}S</span>
      </div>
    </div>
  )
}

