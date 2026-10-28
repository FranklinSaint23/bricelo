'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Store, AlertCircle, Upload, Trash2, Camera, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { slugify } from '@/lib/utils'
import { hideGlobalLoader } from '@/components/ui/product-navigation-loader'
import { VendorStoreShareCard } from '@/components/vendor/vendor-store-share-card'

export default function BoutiquePage() {
  const router = useRouter()
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
        setLogoUrl(data.logo_url ?? null)
      }
      setLoading(false)
    })
  }, [router])

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !store) return

    setUploadingLogo(true)
    setError(null)
    const supabase = createClient()

    try {
      // 1. Redimensionner et compresser l'image côté client
      const compressedDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const img = new window.Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const maxDim = 400
            let w = img.width
            let h = img.height
            if (w > h) {
              if (w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim }
            } else {
              if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim }
            }
            canvas.width = w
            canvas.height = h
            const ctx = canvas.getContext('2d')
            if (!ctx) { resolve(event.target?.result as string); return }
            ctx.drawImage(img, 0, 0, w, h)
            resolve(canvas.toDataURL('image/jpeg', 0.88))
          }
          img.onerror = reject
          img.src = event.target?.result as string
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      // 2. Tenter l'upload dans Supabase Storage (buckets : stores, product-images, products)
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${store.id}/logo-${Date.now()}.${ext}`
      let publicUrl = compressedDataUrl

      for (const bucket of ['stores', 'product-images', 'products']) {
        const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
        if (!upErr) {
          const { data } = supabase.storage.from(bucket).getPublicUrl(path)
          if (data?.publicUrl) {
            publicUrl = data.publicUrl
            break
          }
        }
      }

      setLogoUrl(publicUrl)

      // 3. Sauvegarder en BD
      const { error: dbErr } = await supabase
        .from('stores')
        .update({ logo_url: publicUrl })
        .eq('id', store.id)

      if (dbErr) {
        setError(dbErr.message)
      } else {
        setStore((prev: any) => ({ ...prev, logo_url: publicUrl }))
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur lors du traitement du logo')
    } finally {
      setUploadingLogo(false)
      e.target.value = ''
    }
  }

  async function handleRemoveLogo() {
    if (!store) return
    setUploadingLogo(true)
    setError(null)
    const supabase = createClient()
    const { error: dbErr } = await supabase
      .from('stores')
      .update({ logo_url: null })
      .eq('id', store.id)

    if (dbErr) {
      setError(dbErr.message)
    } else {
      setLogoUrl(null)
      setStore((prev: any) => ({ ...prev, logo_url: null }))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setUploadingLogo(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!store) return
    setError(null)
    setSaving(true)
    const supabase = createClient()
    const { error: err } = await supabase
      .from('stores')
      .update({
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        description: description.trim(),
        logo_url: logoUrl,
      })
      .eq('id', store.id)

    if (err) {
      setError(err.message)
      hideGlobalLoader()
    } else {
      setStore((prev: any) => ({ ...prev, name, slug: slug.trim() || slugify(name), description }))
      setSuccess(true)
      hideGlobalLoader()
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
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--color-navy-900)]">Ma boutique</h1>
        <p className="text-sm text-[var(--color-slate-500)] mt-0.5">Paramètres, image de marque et outils de visibilité</p>
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

      <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-2xl">
        {/* LOGO DE LA BOUTIQUE */}
        <div className="bg-white rounded-xl border border-[var(--color-slate-200)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-[var(--color-navy-900)] text-sm">Logo officiel de votre boutique</h2>
              <p className="text-xs text-[var(--color-slate-500)] mt-0.5">
                Affiché sur la bannière de votre vitrine, sur vos fiches produits et dans les aperçus WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
            {/* Boîte d'aperçu du logo */}
            <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-sm shrink-0 flex items-center justify-center group">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={name || 'Logo boutique'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
                  <Store className="h-8 w-8 text-slate-300" />
                  <span className="text-[10px] font-semibold text-slate-400">Aucun logo</span>
                </div>
              )}

              {uploadingLogo && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                  <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
                </div>
              )}
            </div>

            {/* Actions d'upload */}
            <div className="flex flex-col gap-2.5 flex-1 w-full text-center sm:text-left">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
              />

              <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="px-4 py-2 rounded-xl bg-[var(--color-navy-900)] hover:bg-[var(--color-navy-800)] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <Camera className="h-4 w-4 text-amber-400" />
                  <span>{logoUrl ? 'Changer de logo' : 'Télécharger un logo'}</span>
                </button>

                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    disabled={uploadingLogo}
                    className="px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Supprimer</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-[var(--color-slate-400)]">
                Formats acceptés : PNG, JPG, WebP ou SVG. Format carré ou rond recommandé.
              </p>
            </div>
          </div>
        </div>

        {/* INFORMATIONS GÉNÉRALES */}
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

      {/* ── SECTION PARTAGE & OUTILS COMMERÇANT (LOIN EN DESSOUS) ── */}
      <VendorStoreShareCard
        store={{
          id: store.id,
          name: name || store.name,
          slug: slug || store.slug,
          logo_url: logoUrl,
          description: description || store.description,
          rating: store.rating,
          review_count: store.review_count,
        }}
      />
    </div>
  )
}
