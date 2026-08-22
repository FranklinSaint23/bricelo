'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

interface Props {
  userId: string
  initialData: { full_name: string; phone: string }
}

export function ProfileForm({ userId, initialData }: Props) {
  const router = useRouter()
  const [fullName, setFullName] = useState(initialData.full_name)
  const [phone, setPhone] = useState(initialData.phone)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()
    const { error: err } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), phone: phone.trim() })
      .eq('id', userId)

    if (err) { setError(err.message) }
    else { setSuccess(true); router.refresh() }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nom et Prénom"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Jean Dupont"
      />
      <Input
        label="Téléphone"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+237 6XX XXX XXX"
      />
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      {success && <p className="text-sm text-green-600">Profil mis à jour avec succès.</p>}
      <Button type="submit" loading={loading} className="self-start">Enregistrer</Button>
    </form>
  )
}
