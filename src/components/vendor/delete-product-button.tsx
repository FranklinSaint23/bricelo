'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props { productId: string; productName: string }

export function DeleteProductButton({ productId, productName }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`Supprimer "${productName}" ? Cette action est irréversible.`)) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', productId)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title="Supprimer"
      className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-red-50 text-[var(--color-slate-500)] hover:text-[var(--color-danger)] transition-colors disabled:opacity-40"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
