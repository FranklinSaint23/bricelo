'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Star, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props { addressId: string; isDefault: boolean }

export function AddressActions({ addressId, isDefault }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function setDefault() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('addresses').update({ is_default: true }).eq('id', addressId)
    router.refresh()
    setLoading(false)
  }

  async function remove() {
    if (!confirm('Supprimer cette adresse ?')) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('addresses').delete().eq('id', addressId)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex gap-1 shrink-0">
      {!isDefault && (
        <button
          onClick={setDefault}
          disabled={loading}
          title="Définir par défaut"
          className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-[var(--color-slate-100)] text-[var(--color-slate-400)] hover:text-[var(--color-accent)] transition-colors disabled:opacity-40"
        >
          <Star className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={remove}
        disabled={loading || isDefault}
        title={isDefault ? "Impossible de supprimer l'adresse par défaut" : 'Supprimer'}
        className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-red-50 text-[var(--color-slate-400)] hover:text-[var(--color-danger)] transition-colors disabled:opacity-30"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
