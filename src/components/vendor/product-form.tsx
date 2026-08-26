'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, Plus, Sparkles, Trash2, Layers, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { slugify } from '@/lib/utils'
import Image from 'next/image'

interface Category { id: string; name: string }

export interface VariantFormItem {
  id?: string
  name: string
  value: string
  price_adjustment: number
  stock: number
}

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
  initialVariants?: VariantFormItem[]
  mode: 'create' | 'edit'
}

export function ProductForm({ storeId, categories, initialData, initialVariants = [], mode }: Props) {
  const router = useRouter()
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [uploadingImg, setUploadingImg] = useState(false)

  const [name, setName]               = useState(initialData?.name ?? '')
  const [slug, setSlug]               = useState(initialData?.slug ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [price, setPrice]             = useState(String(initialData?.price ?? ''))
  const [comparePrice, setComparePrice] = useState(String(initialData?.compare_at_price ?? ''))
  const [stock, setStock]             = useState(String(initialData?.stock ?? '10'))
  const [categoryId, setCategoryId]   = useState(initialData?.category_id ?? '')
  const [images, setImages]           = useState<string[]>(initialData?.images ?? [])
  const [promoEndsAt, setPromoEndsAt] = useState((initialData as any)?.promo_ends_at ? (initialData as any).promo_ends_at.slice(0, 16) : '')
  const [isActive, setIsActive]       = useState(initialData?.is_active ?? true)
  const [isFeatured, setIsFeatured]   = useState(initialData?.is_featured ?? false)
  const [isNew, setIsNew]             = useState((initialData as any)?.is_new ?? false)
  const [promoLabel, setPromoLabel]   = useState((initialData as any)?.promotion_label ?? '')

  // --- Gestion des Variantes Dynamiques ---
  const [hasVariants, setHasVariants] = useState(initialVariants.length > 0)
  const [variantsList, setVariantsList] = useState<VariantFormItem[]>(initialVariants)

  // Formulaire d'ajout personnalisé
  const [customName, setCustomName]     = useState('Nombre de places')
  const [customValue, setCustomValue]   = useState('')
  const [customAdj, setCustomAdj]       = useState('0')

  function handleNameChange(val: string) {
    setName(val)
    if (mode === 'create') setSlug(slugify(val))
  }

  // Preset Matelas (Nombre de places & Épaissseurs)
  function applyMattressPreset() {
    setHasVariants(true)
    const mattressVariants: VariantFormItem[] = [
      // Places
      { name: 'Nombre de places', value: '2 places (140/190)', price_adjustment: 0, stock: Number(stock) || 10 },
      { name: 'Nombre de places', value: '3 places (160/190)', price_adjustment: 15000, stock: Number(stock) || 10 },
      { name: 'Nombre de places', value: '4 places (180/190)', price_adjustment: 25000, stock: Number(stock) || 10 },
      { name: 'Nombre de places', value: '5 places Carré (200/200)', price_adjustment: 40000, stock: Number(stock) || 10 },
      // Épaisseurs
      { name: 'Épaisseur', value: '10 CM', price_adjustment: 0, stock: Number(stock) || 10 },
      { name: 'Épaisseur', value: '12 CM', price_adjustment: 5000, stock: Number(stock) || 10 },
      { name: 'Épaisseur', value: '15 CM', price_adjustment: 10000, stock: Number(stock) || 10 },
      { name: 'Épaisseur', value: '17 CM', price_adjustment: 15000, stock: Number(stock) || 10 },
      { name: 'Épaisseur', value: '18 CM', price_adjustment: 20000, stock: Number(stock) || 10 },
      { name: 'Épaisseur', value: '20 CM', price_adjustment: 25000, stock: Number(stock) || 10 },
      { name: 'Épaisseur', value: '25 CM', price_adjustment: 35000, stock: Number(stock) || 10 },
    ]
    setVariantsList(mattressVariants)
  }

  // Preset Vêtements
  function applyClothingPreset() {
    setHasVariants(true)
    const items: VariantFormItem[] = ['S', 'M', 'L', 'XL', 'XXL'].map(v => ({
      name: 'Taille',
      value: v,
      price_adjustment: 0,
      stock: Number(stock) || 10,
    }))
    setVariantsList(items)
  }

  // Preset Chaussures
  function applyShoesPreset() {
    setHasVariants(true)
    const items: VariantFormItem[] = ['39', '40', '41', '42', '43', '44', '45'].map(v => ({
      name: 'Pointure',
      value: v,
      price_adjustment: 0,
      stock: Number(stock) || 10,
    }))
    setVariantsList(items)
  }

  function addCustomVariant() {
    if (!customValue.trim()) return
    const newItem: VariantFormItem = {
      name: customName.trim() || 'Option',
      value: customValue.trim(),
      price_adjustment: Number(customAdj) || 0,
      stock: Number(stock) || 10,
    }
    setVariantsList((prev) => [...prev, newItem])
    setCustomValue('')
    setCustomAdj('0')
  }

  function removeVariant(index: number) {
    setVariantsList((prev) => prev.filter((_, i) => i !== index))
  }

  function updateVariantPrice(index: number, newAdj: number) {
    setVariantsList((prev) => prev.map((item, i) => i === index ? { ...item, price_adjustment: newAdj } : item))
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

    let productId = initialData?.id

    if (mode === 'create') {
      const { data: newProd, error: err } = await supabase
        .from('products')
        .insert(payload)
        .select('id')
        .single()

      if (err || !newProd) { setError(err?.message || 'Erreur création produit'); setLoading(false); return }
      productId = newProd.id
    } else {
      const { error: err } = await supabase.from('products').update(payload).eq('id', productId!)
      if (err) { setError(err.message); setLoading(false); return }
    }

    // --- Synchronisation des Variantes dans product_variants ---
    if (productId) {
      // Nettoyer les anciennes variantes
      await supabase.from('product_variants').delete().eq('product_id', productId)

      if (hasVariants && variantsList.length > 0) {
        const rows = variantsList.map(v => ({
          product_id: productId,
          name: v.name.trim(),
          value: v.value.trim(),
          price_adjustment: Number(v.price_adjustment) || 0,
          stock: Number(v.stock) || Number(stock) || 10,
        }))
        const { error: vErr } = await supabase.from('product_variants').insert(rows)
        if (vErr) console.error('[ProductForm] Erreur insertion variantes:', vErr)
      }
    }

    router.push('/vendeur/produits')
    router.refresh()
  }

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      {/* Infos principales */}
      <Card>
        <CardHeader><p className="font-semibold text-[var(--color-navy-900)]">Informations générales</p></CardHeader>
        <CardBody className="flex flex-col gap-4">
          <Input
            label="Nom du produit *"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Ex : Matelas Orthopédique Bricelo Premium"
            required
          />
          <Input
            label="Slug (URL)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="matelas-orthopedique-bricelo-premium"
            helper="Généré automatiquement depuis le nom."
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
        <CardHeader><p className="font-semibold text-[var(--color-navy-900)]">Prix de base & Stock global</p></CardHeader>
        <CardBody className="grid grid-cols-2 gap-4">
          <Input
            label="Prix de base (FCFA) *"
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="50000"
            required
            helper="Prix du produit sans supplément de variante"
          />
          <Input
            label="Prix barré (FCFA)"
            type="number"
            min="0"
            value={comparePrice}
            onChange={(e) => setComparePrice(e.target.value)}
            placeholder="65000"
            helper="Prix avant promotion"
          />
          <Input
            label="Stock global dispo"
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="10"
          />
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--color-navy-900)]">
              Date de fin de promotion <span className="text-[var(--color-slate-400)] font-normal text-xs">(pour le timer sur la fiche produit)</span>
            </label>
            <input
              type="datetime-local"
              value={promoEndsAt}
              onChange={(e) => setPromoEndsAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="h-10 px-3 text-sm border border-[var(--color-slate-200)] rounded-[var(--radius-md)] bg-white focus:outline-none text-[var(--color-navy-900)]"
            />
          </div>
        </CardBody>
      </Card>

      {/* GESTION DES VARIANTES DYNAMIQUES */}
      <Card className="border-2 border-amber-300/80 shadow-md">
        <CardHeader className="bg-amber-50/60 border-b border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-900">
            <Layers className="h-5 w-5 text-amber-600" />
            <p className="font-bold text-base">Variantes du produit (Tailles, Places, Épaisseurs...)</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-bold text-amber-900">Activer les variantes</span>
            <div className="relative">
              <input type="checkbox" className="sr-only peer" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} />
              <div className="w-10 h-6 rounded-full bg-amber-200 peer-checked:bg-emerald-500 transition-colors" />
              <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
            </div>
          </label>
        </CardHeader>
        <CardBody className="flex flex-col gap-5 p-5">
          {!hasVariants ? (
            <p className="text-xs text-[var(--color-slate-500)] italic text-center py-2">
              Basculez l'interrupteur ci-dessus pour ajouter des choix dynamiques (ex: Matelas 2 à 5 places, Épaisseurs 10 à 25cm, Pointures...).
            </p>
          ) : (
            <>
              {/* Presets rapides */}
              <div className="bg-white p-3.5 rounded-xl border border-amber-200 flex flex-col gap-2">
                <p className="text-xs font-bold text-[var(--color-navy-900)] flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[var(--color-accent)]" /> Modèles de variantes rapides :
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={applyMattressPreset}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200 transition-colors flex items-center gap-1"
                  >
                    🛏️ Matelas (Places & Épaisseurs)
                  </button>
                  <button
                    type="button"
                    onClick={applyClothingPreset}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--color-slate-100)] text-[var(--color-navy-900)] hover:bg-[var(--color-slate-200)] transition-colors"
                  >
                    👕 Vêtements (S, M, L, XL, XXL)
                  </button>
                  <button
                    type="button"
                    onClick={applyShoesPreset}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--color-slate-100)] text-[var(--color-navy-900)] hover:bg-[var(--color-slate-200)] transition-colors"
                  >
                    👞 Chaussures (Pointures 39-45)
                  </button>
                </div>
              </div>

              {/* Formulaire d'ajout personnalisé */}
              <div className="bg-white p-4 rounded-xl border border-[var(--color-slate-200)] flex flex-col gap-3">
                <p className="text-xs font-bold text-[var(--color-navy-900)]">➕ Ajouter une option personnalisée :</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[var(--color-slate-500)] block mb-1">Nom du Type</label>
                    <input
                      type="text"
                      placeholder="Ex: Nombre de places, Épaisseur"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full h-9 px-3 text-xs border border-[var(--color-slate-300)] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[var(--color-slate-500)] block mb-1">Valeur / Option</label>
                    <input
                      type="text"
                      placeholder="Ex: 3 places (160/190) ou 15 CM"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      className="w-full h-9 px-3 text-xs border border-[var(--color-slate-300)] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[var(--color-slate-500)] block mb-1">Supplément Prix (FCFA)</label>
                    <input
                      type="number"
                      placeholder="0 (+15000 FCFA...)"
                      value={customAdj}
                      onChange={(e) => setCustomAdj(e.target.value)}
                      className="w-full h-9 px-3 text-xs border border-[var(--color-slate-300)] rounded-lg font-bold"
                    />
                  </div>
                </div>
                <Button type="button" onClick={addCustomVariant} size="sm" className="self-end gap-1 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Ajouter l'option
                </Button>
              </div>

              {/* Liste des variantes enregistrées */}
              {variantsList.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold text-[var(--color-navy-900)]">
                    Variantes configurées ({variantsList.length}) :
                  </p>
                  <div className="overflow-x-auto border border-[var(--color-slate-200)] rounded-xl bg-white">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[var(--color-slate-50)] border-b border-[var(--color-slate-200)]">
                        <tr>
                          <th className="px-3.5 py-2.5 font-bold text-[var(--color-slate-600)]">Type</th>
                          <th className="px-3.5 py-2.5 font-bold text-[var(--color-slate-600)]">Option / Valeur</th>
                          <th className="px-3.5 py-2.5 font-bold text-[var(--color-slate-600)]">Ajustement Prix (FCFA)</th>
                          <th className="px-3.5 py-2.5 font-bold text-[var(--color-slate-600)] text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-slate-100)]">
                        {variantsList.map((item, idx) => (
                          <tr key={idx} className="hover:bg-amber-50/40">
                            <td className="px-3.5 py-2 font-semibold text-[var(--color-navy-900)]">
                              <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                <Tag className="h-3 w-3 text-slate-500" /> {item.name}
                              </span>
                            </td>
                            <td className="px-3.5 py-2 font-bold text-[var(--color-navy-900)]">{item.value}</td>
                            <td className="px-3.5 py-2">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={item.price_adjustment}
                                  onChange={(e) => updateVariantPrice(idx, Number(e.target.value))}
                                  className="w-24 px-2 py-1 border border-slate-300 rounded font-bold text-xs"
                                />
                                <span className="text-[11px] text-slate-500">FCFA</span>
                              </div>
                            </td>
                            <td className="px-3.5 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => removeVariant(idx)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Photos du produit */}
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

      {/* Visibilité & Badges */}
      <Card>
        <CardHeader><p className="font-semibold text-[var(--color-navy-900)]">Visibilité & Badges</p></CardHeader>
        <CardBody className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-navy-900)]">Étiquette promotionnelle</label>
            <input
              type="text"
              value={promoLabel}
              onChange={(e) => setPromoLabel(e.target.value.slice(0, 40))}
              placeholder='Ex: "SOLDES", "BLACK FRIDAY"'
              maxLength={40}
              className="w-full h-10 rounded-[var(--radius-md)] border border-[var(--color-slate-200)] bg-white px-3 text-sm focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only peer" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
              <div className="w-10 h-6 rounded-full bg-[var(--color-slate-200)] peer-checked:bg-emerald-500 transition-colors" />
              <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-navy-900)]">Badge "Nouveau"</p>
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
