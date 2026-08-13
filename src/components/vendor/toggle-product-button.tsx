'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props { productId: string; isActive: boolean }

export function ToggleProductButton({ productId, isActive }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('products').update({ is_active: !isActive }).eq('id', productId)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={isActive ? 'Masquer' : 'Publier'}
      className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-[var(--color-slate-100)] text-[var(--color-slate-500)] hover:text-[var(--color-navy-900)] transition-colors disabled:opacity-40"
    >
      {isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  )
}
