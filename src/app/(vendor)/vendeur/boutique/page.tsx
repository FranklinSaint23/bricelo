'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Store, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { slugify } from '@/lib/utils'

export default function BoutiquePage() {
  const router = useRouter()
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      const { data } = await supabase
        .from('stores')
        .select('id, name, slug, description, logo_url, is_active, rating, review_count')
        .eq('user_id', user.id)
        .single()
      if (data) {
        setStore(data)
        setName(data.name)
        setSlug(data.slug)
        setDescription(data.description ?? '')
      }
      setLoading(false)
    })
  }, [router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!store) return
    setError(null)
    setSaving(true)
    const supabase = createClient()
    const { error: err } = await supabase
      .from('stores')
      .update({ name: name.trim(), slug: slug.trim() || slugify(name), description: description.trim() })
      .eq('id', store.id)
    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="h-8 w-48 bg-[var(--color-slate-100)] rounded animate-pulse mb-6" />
        <div className="bg-white rounded-xl border border-[var(--color-slate-200)] p-6 flex flex-col gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-[var(--color-slate-100)] rounded animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="p-6 lg:p-8 flex flex-col items-center gap-4 text-center mt-16">
        <AlertCircle className="h-10 w-10 text-[var(--color-slate-300)]" />
        <p className="font-semibold text-[var(--color-navy-900)]">Pas de boutique associée à votre compte</p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--color-navy-900)]">Ma boutique</h1>
        <p className="text-sm text-[var(--color-slate-500)] mt-0.5">Paramètres et informations publiques</p>
      </div>

      {/* Statut */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border mb-6 text-sm
        ${store.is_active
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
        <Store className="h-4 w-4 shrink-0" />
        <div>
          {store.is_active
            ? 'Votre boutique est active et visible par les acheteurs.'
            : 'Votre boutique est en attente d\'activation par un administrateur.'}
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        <div className="bg-white rounded-xl border border-[var(--color-slate-200)] p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-[var(--color-navy-900)] text-sm">Informations générales</h2>

          <Input
            label="Nom de la boutique"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setSlug(slugify(e.target.value))
            }}
            placeholder="Ma Super Boutique"
            required
          />
          <Input
            label="Slug (URL publique)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="ma-super-boutique"
            helper={`bricelo.com/boutique/${slug || '…'}`}
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez votre boutique, vos spécialités, vos valeurs…"
          />
        </div>

        {/* Stats lecture seule */}
        <div className="bg-white rounded-xl border border-[var(--color-slate-200)] p-5">
          <h2 className="font-semibold text-[var(--color-navy-900)] text-sm mb-4">Statistiques</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-[var(--color-slate-50)]">
              <p className="text-xs text-[var(--color-slate-500)]">Note moyenne</p>
              <p className="text-xl font-bold text-[var(--color-navy-900)]">{store.rating > 0 ? `${Number(store.rating).toFixed(1)} / 5` : '—'}</p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--color-slate-50)]">
              <p className="text-xs text-[var(--color-slate-500)]">Avis clients</p>
              <p className="text-xl font-bold text-[var(--color-navy-900)]">{store.review_count}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-medium">Modifications enregistrées ✓</div>
        )}

        <Button type="submit" loading={saving} size="lg" className="self-start">
          Enregistrer les modifications
        </Button>
      </form>
    </div>
  )
}
