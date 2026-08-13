'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard } from 'lucide-react'

interface Props { orderIds: string[]; amount: number }

export function CinetPayButton({ orderIds, amount }: Props) {
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
      <Button onClick={handlePay} loading={loading} size="lg" className="w-full">
        <CreditCard className="h-4 w-4" />
        Payer maintenant
      </Button>
      {error && <p className="text-sm text-center text-[var(--color-danger)]">{error}</p>}
      <p className="text-xs text-center text-[var(--color-slate-400)]">
        Vous serez redirigé vers CinetPay pour finaliser le paiement en toute sécurité.
      </p>
    </div>
  )
}
