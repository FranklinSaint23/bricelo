'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { slugify } from '@/lib/utils'
import Image from 'next/image'

interface Category { id: string; name: string }

interface ProductData {
  id?: string
  name?: string
  slug?: string
  description?: string
  price?: number
  compare_at_price?: number | null
  stock?: number
  category_id?: string | null
  images?: string[]
  is_active?: boolean
  is_featured?: boolean
}

interface Props {
  storeId: string
  categories: Category[]
  initialData?: ProductData
  mode: 'create' | 'edit'
}

export function ProductForm({ storeId, categories, initialData, mode }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingImg, setUploadingImg] = useState(false)

  const [name, setName]               = useState(initialData?.name ?? '')
  const [slug, setSlug]               = useState(initialData?.slug ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [price, setPrice]             = useState(String(initialData?.price ?? ''))
  const [comparePrice, setComparePrice] = useState(String(initialData?.compare_at_price ?? ''))
  const [stock, setStock]             = useState(String(initialData?.stock ?? '0'))
  const [categoryId, setCategoryId]   = useState(initialData?.category_id ?? '')
  const [images, setImages]           = useState<string[]>(initialData?.images ?? [])
  const [promoEndsAt, setPromoEndsAt]   = useState((initialData as any)?.promo_ends_at ? (initialData as any).promo_ends_at.slice(0, 16) : '')
  const [isActive, setIsActive]         = useState(initialData?.is_active ?? true)
  const [isFeatured, setIsFeatured]     = useState(initialData?.is_featured ?? false)
  const [isNew, setIsNew]               = useState((initialData as any)?.is_new ?? false)
  const [promoLabel, setPromoLabel]     = useState((initialData as any)?.promotion_label ?? '')

  function handleNameChange(val: string) {
    setName(val)
    if (mode === 'create') setSlug(slugify(val))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploadingImg(true)
    const supabase = createClient()
    const uploaded: string[] = []
    for (const file of files) {
      const ext  = file.name.split('.').pop()
      const path = `products/${storeId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: upErr } = await supabase.storage.from('product-images').upload(path, file, { upsert: false })
      if (!upErr) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(path)
        uploaded.push(data.publicUrl)
      }
    }
    setImages((prev) => [...prev, ...uploaded])
    setUploadingImg(false)
    e.target.value = ''
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((i) => i !== url))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) { setError('Le nom du produit est requis.'); return }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) { setError('Le prix doit être un nombre positif.'); return }

    setLoading(true)
    const supabase = createClient()

    const payload = {
      store_id:         storeId,
      name:             name.trim(),
      slug:             slug.trim() || slugify(name),
      description:      description.trim(),
      price:            Number(price),
      compare_at_price: comparePrice ? Number(comparePrice) : null,
      promo_ends_at:    promoEndsAt ? new Date(promoEndsAt).toISOString() : null,
      stock:            Number(stock) || 0,
      category_id:      categoryId || null,
      images,
      is_active:        isActive,
      is_featured:      isFeatured,
      is_new:           isNew,
      promotion_label:  promoLabel.trim() || null,
    }

    if (mode === 'create') {
      const { error: err } = await supabase.from('products').insert(payload)
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      const { error: err } = await supabase.from('products').update(payload).eq('id', initialData!.id!)
      if (err) { setError(err.message); setLoading(false); return }
    }

    router.push('/vendeur/produits')
    router.refresh()
  }

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
      {/* Infos principales */}
      <Card>
        <CardHeader><p className="font-semibold text-[var(--color-navy-900)]">Informations générales</p></CardHeader>
        <CardBody className="flex flex-col gap-4">
          <Input
            label="Nom du produit *"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Ex : Smartphone Samsung Galaxy A55"
            required
          />
          <Input
            label="Slug (URL)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="smartphone-samsung-galaxy-a55"
            helper="Généré automatiquement depuis le nom. Doit être unique."
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez votre produit : caractéristiques, dimensions, matières…"
          />
          <Select
            label="Catégorie"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={categoryOptions}
            placeholder="— Choisir une catégorie —"
          />
        </CardBody>
      </Card>

      {/* Prix & stock */}
      <Card>
        <CardHeader><p className="font-semibold text-[var(--color-navy-900)]">Prix & stock</p></CardHeader>
        <CardBody className="grid grid-cols-2 gap-4">
          <Input
            label="Prix (FCFA) *"
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="15000"
            required
          />
          <Input
            label="Prix barré (FCFA)"
            type="number"
            min="0"
            value={comparePrice}
            onChange={(e) => setComparePrice(e.target.value)}
            placeholder="20000"
            helper="Laissez vide s'il n'y a pas de promotion"
          />
          <Input
            label="Stock disponible"
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="10"
          />
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--color-navy-900)]">
              Date de fin de promotion <span className="text-[var(--color-slate-400)] font-normal text-xs">(pour le timer sur le produit)</span>
            </label>
            <input
              type="datetime-local"
              value={promoEndsAt}
              onChange={(e) => setPromoEndsAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="h-10 px-3 text-sm border border-[var(--color-slate-200)] rounded-[var(--radius-md)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent text-[var(--color-navy-900)]"
            />
            <p className="text-xs text-[var(--color-slate-500)]">
              Le timer compte à rebours jusqu'à cette date. Laissez vide pour un timer quotidien (minuit).
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader><p className="font-semibold text-[var(--color-navy-900)]">Photos du produit</p></CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            {images.map((url) => (
              <div key={url} className="relative h-24 w-24 rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-slate-200)] group">
                <Image src={url} alt="photo produit" fill className="object-cover" sizes="96px" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            ))}

            <label className={`h-24 w-24 rounded-[var(--radius-md)] border-2 border-dashed border-[var(--color-slate-300)] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[var(--color-accent)] hover:bg-[var(--color-slate-50)] transition-colors ${uploadingImg ? 'opacity-50 cursor-wait' : ''}`}>
              <Upload className="h-5 w-5 text-[var(--color-slate-400)]" />
              <span className="text-xs text-[var(--color-slate-400)]">{uploadingImg ? 'Upload…' : 'Ajouter'}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploadingImg} />
            </label>
          </div>
          <p className="text-xs text-[var(--color-slate-400)]">JPG, PNG ou WebP. La première image sera utilisée comme vignette principale.</p>
        </CardBody>
      </Card>

      {/* Visibilité */}
      <Card>
        <CardHeader><p className="font-semibold text-[var(--color-navy-900)]">Visibilité</p></CardHeader>
        <CardBody className="flex flex-col gap-3">
          {/* Étiquette promo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-navy-900)]">Étiquette promotionnelle</label>
            <input
              type="text"
              value={promoLabel}
              onChange={(e) => setPromoLabel(e.target.value.slice(0, 40))}
              placeholder='Ex: "SOLDES", "BLACK FRIDAY", "DÉSTOCKAGE"'
              maxLength={40}
              className="w-full h-10 rounded-[var(--radius-md)] border border-[var(--color-slate-200)] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
            />
            <p className="text-xs text-[var(--color-slate-500)]">Affiché en badge doré sur la carte produit (max 40 caractères). Laissez vide si aucune promo.</p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only peer" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
              <div className="w-10 h-6 rounded-full bg-[var(--color-slate-200)] peer-checked:bg-emerald-500 transition-colors" />
              <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-navy-900)]">Badge "Nouveau"</p>
              <p className="text-xs text-[var(--color-slate-500)]">Affiche un badge vert "NOUVEAU" sur la carte produit</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only peer" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <div className="w-10 h-6 rounded-full bg-[var(--color-slate-200)] peer-checked:bg-[var(--color-accent)] transition-colors" />
              <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-navy-900)]">Publié</p>
              <p className="text-xs text-[var(--color-slate-500)]">Le produit est visible par les acheteurs</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only peer" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              <div className="w-10 h-6 rounded-full bg-[var(--color-slate-200)] peer-checked:bg-[var(--color-accent)] transition-colors" />
              <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-navy-900)]">Mis en avant</p>
              <p className="text-xs text-[var(--color-slate-500)]">Apparaît dans la section "Produits en vedette" de l'accueil</p>
            </div>
          </label>
        </CardBody>
      </Card>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-3">
        <Button type="submit" loading={loading} size="lg">
          {mode === 'create' ? 'Créer le produit' : 'Enregistrer les modifications'}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
