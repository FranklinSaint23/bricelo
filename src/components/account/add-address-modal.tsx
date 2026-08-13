'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props { userId: string }

export function AddAddressModal({ userId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [label, setLabel]         = useState('')
  const [fullName, setFullName]   = useState('')
  const [phone, setPhone]         = useState('')
  const [line1, setLine1]         = useState('')
  const [line2, setLine2]         = useState('')
  const [city, setCity]           = useState('')
  const [region, setRegion]       = useState('')
  const [country, setCountry]     = useState('Cameroun')
  const [postal, setPostal]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim() || !line1.trim() || !city.trim()) {
      setError('Nom, adresse et ville sont requis.')
      return
    }
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.from('addresses').insert({
      user_id:       userId,
      label:         label.trim() || null,
      full_name:     fullName.trim(),
      phone:         phone.trim(),
      address_line1: line1.trim(),
      address_line2: line2.trim() || null,
      city:          city.trim(),
      region:        region.trim() || null,
      country:       country.trim(),
      postal_code:   postal.trim() || null,
    })
    if (err) { setError(err.message); setLoading(false); return }
    setOpen(false)
    router.refresh()
    setLoading(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Ajouter une adresse
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-[var(--radius-2xl)] w-full max-w-md shadow-xl p-6 flex flex-col gap-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--color-navy-900)]">Nouvelle adresse</h2>
              <button onClick={() => setOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-[var(--color-slate-100)]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Input label="Libellé (optionnel)" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Maison, Bureau…" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Nom complet *" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jean Dupont" required />
                <Input label="Téléphone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+237 6XX XXX XXX" />
              </div>
              <Input label="Adresse *" value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="Rue, quartier, N°" required />
              <Input label="Complément" value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Appartement, bâtiment…" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Ville *" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Yaoundé" required />
                <Input label="Région" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Centre" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Pays" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Cameroun" />
                <Input label="Code postal" value={postal} onChange={(e) => setPostal(e.target.value)} placeholder="00000" />
              </div>

              {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

              <div className="flex gap-3 mt-2">
                <Button type="submit" loading={loading} className="flex-1">Enregistrer</Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Annuler</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
