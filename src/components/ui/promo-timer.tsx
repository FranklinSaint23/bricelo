'use client'

import { useState, useEffect } from 'react'
import { Timer } from 'lucide-react'
import { cn } from '@/lib/utils'

function getTarget(endsAt?: string | null): Date {
  if (endsAt) {
    const d = new Date(endsAt)
    if (!isNaN(d.getTime()) && d > new Date()) return d
  }
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0)
  return midnight
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

  if (ms === 0) return null

  const h   = Math.floor(ms / 3_600_000)
  const m   = Math.floor((ms % 3_600_000) / 60_000)
  const s   = Math.floor((ms % 60_000) / 1_000)
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <Timer className="h-4 w-4 text-red-500 shrink-0 animate-pulse" />
      <span className="text-xs font-semibold text-[var(--color-slate-500)] uppercase tracking-wide">
        Expire dans
      </span>
      <div className="flex items-center gap-0.5">
        {[pad(h), pad(m), pad(s)].map((v, i) => (
          <span key={i} className="flex items-center gap-0.5">
            {i > 0 && <span className="text-[var(--color-slate-400)] font-bold text-sm">:</span>}
            <span className="font-mono font-bold text-sm bg-[var(--color-navy-900)] text-white px-1.5 py-0.5 rounded">
              {v}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
