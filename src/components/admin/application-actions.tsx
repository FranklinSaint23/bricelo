'use client'

import { useTransition } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { approveVendorApplication, rejectVendorApplication } from '@/app/(admin)/admin/vendeurs/actions'

export function AdminApplicationActions({ applicationId }: { applicationId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleApprove() {
    startTransition(async () => {
      await approveVendorApplication(applicationId)
    })
  }

  function handleReject() {
    startTransition(async () => {
      await rejectVendorApplication(applicationId)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleApprove}
        disabled={isPending}
        title="Approuver la candidature et créer la boutique"
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        {isPending ? 'En cours…' : 'Approuver'}
      </button>
      <button
        onClick={handleReject}
        disabled={isPending}
        title="Refuser"
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
      >
        <XCircle className="h-3.5 w-3.5" />
        Refuser
      </button>
    </div>
  )
}
