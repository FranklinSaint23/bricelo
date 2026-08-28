'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard } from 'lucide-react'

interface Props { orderIds: string[]; amount: number }

export function CamPayButton({ orderIds, amount }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handlePay() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/paiement/initier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds, amount }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur de paiement')
      window.location.href = data.payment_url
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button onClick={handlePay} loading={loading} size="lg" className="w-full font-bold bg-amber-400 text-slate-950 hover:bg-amber-500 py-4 shadow-md">
        <CreditCard className="h-4.5 w-4.5" />
        Payer avec Mobile Money / CamPay
      </Button>
      {error && <p className="text-xs text-center text-rose-600 font-bold bg-rose-50 p-3 rounded-xl border border-rose-200">{error}</p>}
      <p className="text-xs text-center text-slate-500">
        Vous serez redirigé vers la passerelle sécurisée CamPay pour valider votre paiement (Orange Money & MTN MoMo).
      </p>
    </div>
  )
}

// Alias pour compatibilité
export const CinetPayButton = CamPayButton
