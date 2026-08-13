'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function AdminToggleStore({ storeId, isActive }: { storeId: string; isActive: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('stores').update({ is_active: !isActive }).eq('id', storeId)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50
        ${isActive
          ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'}`}
    >
      {loading ? '…' : isActive ? 'Désactiver' : 'Activer'}
    </button>
  )
}
