'use client'

import { useTransition } from 'react'
import { CheckCircle } from 'lucide-react'
import { validateCashOrder } from '@/app/(admin)/admin/commandes/actions'

export function ValidateCashButton({ orderId }: { orderId: string }) {
  const [isPending, start] = useTransition()

  function handleClick() {
    start(async () => {
      await validateCashOrder(orderId)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50 transition-colors border border-green-300"
    >
      <CheckCircle className="h-3.5 w-3.5" />
      {isPending ? 'Validation…' : 'Valider espèces'}
    </button>
  )
}
