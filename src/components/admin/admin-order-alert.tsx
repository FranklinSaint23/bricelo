'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, X, Mail } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

function playChimeSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    const now = ctx.currentTime
    // Note 1: E5 (659.25Hz)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(659.25, now)
    gain1.gain.setValueAtTime(0.3, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.5)

    // Note 2: A5 (880Hz)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, now + 0.2)
    gain2.gain.setValueAtTime(0.4, now + 0.2)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.2)
    osc2.stop(now + 0.9)
  } catch (err) {
    console.error('Erreur lecture audio chime:', err)
  }
}

export function AdminOrderAlert() {
  const [latestOrder, setLatestOrder] = useState<any | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new
          setLatestOrder(newOrder)
          playChimeSound()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (!latestOrder) return null

  const orderId = latestOrder.id?.slice(0, 8).toUpperCase() ?? ''
  const amount = latestOrder.total ?? 0
  const addr = latestOrder.shipping_address ?? {}
  const clientName = addr.full_name || 'Client'

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full bg-slate-900 text-white border-2 border-amber-400 rounded-2xl p-4 shadow-2xl animate-bounce">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold">
            <Bell className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <p className="font-extrabold text-sm text-amber-400 tracking-wide">
              🎉 NOUVELLE COMMANDE REÇUE !
            </p>
            <p className="text-xs text-slate-300 font-mono">#{orderId} • {formatPrice(amount)}</p>
          </div>
        </div>
        <button
          onClick={() => setLatestOrder(null)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-300">Client: <strong>{clientName}</strong></span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-medium">
          <Mail className="h-3.5 w-3.5 text-amber-400" />
          <span>E-mail envoyé</span>
        </span>
      </div>
    </div>
  )
}
