'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { reviewVendorApplication } from '@/app/(admin)/admin/vendeurs/actions'

export function VendorApplicationActions({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  const [showNote, setShowNote] = useState(false)
  const [note, setNote] = useState('')
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null)

  function handle(status: 'approved' | 'rejected') {
    startTransition(async () => {
      await reviewVendorApplication(id, status, note || undefined)
      setDone(status)
    })
  }

  if (done === 'approved') return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
      <CheckCircle2 className="h-3.5 w-3.5" /> Approuvée
    </span>
  )
  if (done === 'rejected') return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-lg">
      <XCircle className="h-3.5 w-3.5" /> Rejetée
    </span>
  )

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={() => handle('approved')}
          disabled={pending}
          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Approuver
        </button>
        <button
          onClick={() => handle('rejected')}
          disabled={pending}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <XCircle className="h-3.5 w-3.5" /> Rejeter
        </button>
        <button
          onClick={() => setShowNote((v) => !v)}
          className="flex items-center gap-1 px-2 py-1.5 text-[var(--color-slate-500)] hover:text-[var(--color-navy-900)] text-xs transition-colors"
          title="Ajouter une note"
        >
          {showNote ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>
      {showNote && (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note admin (optionnelle)…"
          rows={2}
          className="text-xs px-2 py-1.5 border border-[var(--color-slate-200)] rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
        />
      )}
    </div>
  )
}
