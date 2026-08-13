'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, XCircle } from 'lucide-react'

export function AdminApplicationActions({ applicationId }: { applicationId: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function updateStatus(status: 'approved' | 'rejected') {
    startTransition(async () => {
      const supabase = createClient()
      await supabase
        .from('vendor_applications')
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq('id', applicationId)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => updateStatus('approved')}
        disabled={isPending}
        title="Approuver"
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Approuver
      </button>
      <button
        onClick={() => updateStatus('rejected')}
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
