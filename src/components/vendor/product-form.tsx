'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, Plus, Sparkles, Trash2, Layers, Tag, BedDouble, Shirt, Footprints, AlertCircle, FileText, Download, Link as LinkIcon, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { slugify } from '@/lib/utils'
import Image from 'next/image'

import { VariantMatrixEditor } from '@/components/vendor/variant-matrix-editor'
import { saveProductOptionsAndVariants } from '@/lib/product-variant-saver'
import { ProductOption, AdvancedProductVariant } from '@/types/variants'

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
  product_type?: 'simple' | 'variable' | 'digital'
  digital_file_url?: string | null
}

interface Props {
  storeId: string
  categories: Category[]
  initialData?: ProductData
  initialVariants?: VariantFormItem[]
  initialOptions?: ProductOption[]
  initialAdvancedVariants?: AdvancedProductVariant[]
  mode: 'create' | 'edit'
}

export function ProductForm({
  storeId,
  categories,
  initialData,
  initialVariants = [],
  initialOptions = [],
  initialAdvancedVariants = [],
  mode,
}: Props) {
  const router = useRouter()
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState<string | null>(null)
  const [uploadingImg, setUploadingImg]       = useState(false)
  const [uploadingDigitalFile, setUploadingDigitalFile] = useState(false)

  // Type de Produit (Simple, Variable, Digital)
  const initialType: 'simple' | 'variable' | 'digital' = (initialData as any)?.product_type ?? (initialOptions.length > 0 || initialAdvancedVariants.length > 0 ? 'variable' : 'simple')
  const [productType, setProductType]         = useState<'simple' | 'variable' | 'digital'>(initialType)

  const [name, setName]                       = useState(initialData?.name ?? '')
  const [slug, setSlug]                       = useState(initialData?.slug ?? '')
  const [description, setDescription]         = useState(initialData?.description ?? '')
  const [price, setPrice]                     = useState(String(initialData?.price ?? ''))
  const [comparePrice, setComparePrice]       = useState(String(initialData?.compare_at_price ?? ''))
  const [stock, setStock]                     = useState(String(initialData?.stock ?? '10'))
  const [categoryId, setCategoryId]           = useState(initialData?.category_id ?? '')
  const [images, setImages]                   = useState<string[]>(initialData?.images ?? [])
  const [digitalFileUrl, setDigitalFileUrl]   = useState((initialData as any)?.digital_file_url ?? '')
  const [promoEndsAt, setPromoEndsAt]         = useState((initialData as any)?.promo_ends_at ? (initialData as any).promo_ends_at.slice(0, 16) : '')
  const [isActive, setIsActive]               = useState(initialData?.is_active ?? true)
  const [isFeatured, setIsFeatured]           = useState(initialData?.is_featured ?? false)
  const [isNew, setIsNew]                     = useState((initialData as any)?.is_new ?? false)
  const [promoLabel, setPromoLabel]           = useState((initialData as any)?.promotion_label ?? '')

  // --- Gestion des Variantes Dynamiques ---
  const [hasVariants, setHasVariants]         = useState(initialOptions.length > 0 || initialAdvancedVariants.length > 0 || initialVariants.length > 0)
  const [options, setOptions]                 = useState<ProductOption[]>(initialOptions)
  const [advancedVariants, setAdvancedVariants] = useState<AdvancedProductVariant[]>(initialAdvancedVariants)

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

  // Upload Fichier Digital (Limite stricte à 500 Ko)
  async function handleDigitalFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérification de la limite de taille à 500 Ko (500 * 1024 octets)
    const maxSizeBytes = 500 * 1024
    if (file.size > maxSizeBytes) {
      setError(`Fichier trop lourd (${(file.size / 1024).toFixed(1)} Ko). La limite maximale autorisée pour un produit digital est de 500 Ko. Pour les fichiers plus volumineux, veuillez saisir un lien de téléchargement direct ci-dessous.`)
      e.target.value = ''
      return
    }

    setError(null)
    setUploadingDigitalFile(true)
    const supabase = createClient()
    try {
      const ext = file.name.split('.').pop()
      const path = `digital/${storeId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      let bucketName = 'product-images'

      let { error: upErr } = await supabase.storage.from(bucketName).upload(path, file, { upsert: false })
      if (upErr && upErr.message?.toLowerCase().includes('bucket not found')) {
        bucketName = 'products'
        const res = await supabase.storage.from(bucketName).upload(path, file, { upsert: false })
        upErr = res.error
      }

      if (upErr) throw upErr

      const { data } = supabase.storage.from(bucketName).getPublicUrl(path)
      setDigitalFileUrl(data.publicUrl)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du téléversement du fichier digital.')
    } finally {
      setUploadingDigitalFile(false)
      e.target.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) { setError('Le nom du produit est requis.'); return }
    if (productType !== 'variable' && (!price || isNaN(Number(price)) || Number(price) <= 0)) {
      setError('Le prix de base doit être un nombre positif.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const payload = {
      store_id:         storeId,
      name:             name.trim(),
      slug:             slug.trim() || slugify(name),
      product_type:     productType,
      description:      description.trim(),
      price:            productType === 'variable' ? 0 : Number(price),
      compare_at_price: comparePrice ? Number(comparePrice) : null,
      promo_ends_at:    promoEndsAt ? new Date(promoEndsAt).toISOString() : null,
      stock:            productType === 'digital' ? 9999 : (productType === 'variable' ? 0 : (Number(stock) || 0)),
      category_id:      categoryId || null,
      digital_file_url: productType === 'digital' ? (digitalFileUrl.trim() || null) : null,
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

    // --- Enregistrement relationnel des Options & Variantes ---
    if (productId) {
      const isVariableType = productType === 'variable'
      await saveProductOptionsAndVariants(
        supabase,
        productId,
        isVariableType,
        isVariableType ? options : [],
        isVariableType ? advancedVariants : []
      )
    }

    router.push('/vendeur/produits')
    router.refresh()
  }

  // Filtrage intelligent des catégories pour les produits digitaux
  const DIGITAL_KEYWORDS = ['livre', 'book', 'logiciel', 'software', 'formation', 'cours', 'digital', 'numérique', 'ebook', 'app', 'médias', 'audio', 'pdf', 'service', 'virtuel', 'téléchargement', 'informatique']
  const digitalCategories = categories.filter((c) => {
    const nameLower = c.name.toLowerCase()
    return DIGITAL_KEYWORDS.some((kw) => nameLower.includes(kw))
  })

  const availableCategories = (productType === 'digital' && digitalCategories.length > 0)
    ? digitalCategories
    : categories

  const categoryOptions = availableCategories.map((c) => ({ value: c.id, label: c.name }))

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Infos principales */}
      <Card>
        <CardHeader><p className="font-bold text-base text-[var(--color-navy-900)]">Informations générales</p></CardHeader>
        <CardBody className="flex flex-col gap-4">
          <Input
            label="Nom du produit *"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Ex : E-Book Guide E-Commerce ou Matelas Premium"
            required
          />
          <Input
            label="Slug (URL)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="matelas-orthopedique-bricelo-premium"
            helper="Généré automatiquement depuis le nom."
          />

          {/* SÉLECTEUR DU TYPE DE PRODUIT */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[var(--color-navy-900)] flex items-center gap-1.5">
              <span>Type de Produit *</span>
            </label>
            <select
              value={productType}
              onChange={(e) => {
                const newType = e.target.value as 'simple' | 'variable' | 'digital'
                setProductType(newType)
                if (newType === 'variable') setHasVariants(true)
                else setHasVariants(false)

                if (newType === 'digital' && digitalCategories.length > 0) {
                  if (!digitalCategories.some((c) => c.id === categoryId)) {
                    setCategoryId(digitalCategories[0].id)
                  }
                }
              }}
              className="h-10 px-3 text-xs sm:text-sm border-2 border-amber-300 rounded-[var(--radius-md)] bg-white font-bold text-[var(--color-navy-900)] focus:outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
            >
              <option value="simple">Produit Simple (Article physique standard sans déclinaisons)</option>
              <option value="variable">Produit à Variantes (Tailles, Pointures, Couleurs, Stockage, RAM...)</option>
              <option value="digital">Produit Digital / Numérique (Livre E-Book, Logiciel, Formation, PDF...)</option>
            </select>
          </div>

          {/* CATÉGORIE (Placée au-dessus de la Description) */}
          <div className="flex flex-col gap-1">
            <Select
              label={productType === 'digital' ? "Catégorie (Produits Digitaux) *" : "Catégorie *"}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={categoryOptions}
              placeholder="— Choisir une catégorie —"
            />
            {productType === 'digital' && (
              <p className="text-[11px] text-[var(--color-slate-500)] italic">
                Catégories adaptées aux livres, e-books, logiciels, formations et téléchargements.
              </p>
            )}
          </div>

          {/* DESCRIPTION (Placée en dessous du Type et de la Catégorie) */}
          <Textarea
            label="Description du produit"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez votre produit : caractéristiques, fonctionnalités, sommaire du livre ou contenu..."
            rows={4}
          />
        </CardBody>
      </Card>

      {/* PRIX, STOCK ET TIMER (Conditionné selon Produit Simple, Variable ou Digital) */}
      <Card>
        <CardHeader>
          <p className="font-bold text-base text-[var(--color-navy-900)]">
            {productType === 'variable'
              ? 'Tarification & Promotions (Variantes)'
              : productType === 'digital'
              ? 'Tarification du Produit Digital'
              : 'Prix de base & Stock global'}
          </p>
        </CardHeader>
        <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Si Produit Variable : Les prix et stocks sont définis par variante dans la matrice */}
          {productType === 'variable' ? (
            <div className="col-span-2 p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold leading-relaxed">
              Les prix et stocks pour un produit à variantes sont configurés individuellement par déclinaison (Taille, Couleur, RAM...) dans le tableau des variantes ci-dessous.
            </div>
          ) : (
            <>
              <Input
                label="Prix de vente (FCFA) *"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="50000"
                required
              />
              <Input
                label="Prix barré / Réduction (FCFA)"
                type="number"
                min="0"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                placeholder="65000"
                helper="Prix d'origine avant réduction"
              />
            </>
          )}

          {/* Champ Stock global (Masqué pour Produit Variable et Produit Digital) */}
          {productType === 'simple' && (
            <Input
              label="Stock disponible *"
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="10"
            />
          )}

          {/* Date de fin de promotion (Présent pour TOUS les types y compris Produit Variable) */}
          <div className="col-span-1 sm:col-span-2 flex flex-col gap-1">
            <label className="text-xs font-bold text-[var(--color-navy-900)]">
              Date de fin de promotion <span className="text-[var(--color-slate-400)] font-normal text-xs">(pour afficher le compte à rebours sur la fiche produit)</span>
            </label>
            <input
              type="datetime-local"
              value={promoEndsAt}
              onChange={(e) => setPromoEndsAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="h-10 px-3 text-xs sm:text-sm border border-[var(--color-slate-200)] rounded-[var(--radius-md)] bg-white focus:outline-none text-[var(--color-navy-900)] font-medium"
            />
          </div>
        </CardBody>
      </Card>

      {/* SECTION PRODUIT DIGITAL (Téléchargement du Fichier ou Lien d'accès) */}
      {productType === 'digital' && (
        <Card className="border-2 border-indigo-300 shadow-sm bg-indigo-50/20">
          <CardHeader className="bg-indigo-950 text-white p-4 rounded-t-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Livraison & Accès au Produit Digital</h3>
          </CardHeader>
          <CardBody className="p-5 space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium space-y-1">
              <p className="font-bold">Instructions pour les Produits Digitaux :</p>
              <p>1. Les clients recevront un accès immédiat pour télécharger ce produit après paiement en ligne sécurisé.</p>
              <p>2. Le paiement en espèces à la livraison est automatiquement désactivé lors de l'achat de ce produit.</p>
            </div>

            {/* Option 1 : Upload de fichier (max 500 Ko) */}
            <div>
              <label className="block text-xs font-extrabold text-[var(--color-navy-900)] mb-1.5">
                Fichier Numérique à Télécharger (Limite max : 500 Ko)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl border-2 border-dashed border-indigo-300 hover:border-amber-400 bg-white text-xs font-bold text-indigo-900 transition-all shadow-2xs">
                    <Download className="h-4 w-4 text-amber-500" />
                    <span>{uploadingDigitalFile ? 'Téléversement du fichier en cours...' : digitalFileUrl ? 'Remplacer le fichier digital' : 'Téléverser le fichier (max 500 Ko)'}</span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.epub,.zip,.rar,.txt,.docx,.png,.jpg,.jpeg"
                    disabled={uploadingDigitalFile}
                    onChange={handleDigitalFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Option 2 : Lien URL direct d'accès */}
            <div className="pt-2">
              <label className="block text-xs font-extrabold text-[var(--color-navy-900)] mb-1">
                Ou Lien URL direct d'accès / Téléchargement :
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={digitalFileUrl}
                  onChange={(e) => setDigitalFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/... ou https://mon-serveur.com/logiciel.zip"
                  className="pl-9 text-xs font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 italic">
                Saisissez l'URL vers votre fichier hébergé (Google Drive, Dropbox, Cloud) ou le lien d'activation.
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* GESTION DES VARIANTES DYNAMIQUES (Affiché UNIQUEMENT si productType === 'variable') */}
      {productType === 'variable' && (
        <Card className="border-2 border-amber-300/80 shadow-md">
          <CardHeader className="bg-amber-50/60 border-b border-amber-200/80 flex items-center justify-between p-4">
            <div className="flex items-center gap-2 text-amber-900">
              <Layers className="h-5 w-5 text-amber-600" />
              <p className="font-bold text-base">Matrice des Variantes (Tailles, Pointures, Stockage...)</p>
            </div>
          </CardHeader>
          <CardBody className="flex flex-col gap-5 p-5">
            <VariantMatrixEditor
              productName={name}
              basePrice={Number(price) || 0}
              baseStock={Number(stock) || 10}
              initialOptions={options}
              initialVariants={advancedVariants}
              onChangeOptions={(newOpts) => setOptions(newOpts)}
              onChangeVariants={(newVars) => setAdvancedVariants(newVars)}
            />
          </CardBody>
        </Card>
      )}

      {/* Photos du produit (Garder la photo du produit même pour Produit Digital) */}
      <Card>
        <CardHeader><p className="font-semibold text-[var(--color-navy-900)]">Photos & Visuel de Couverture</p></CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            {images.map((url) => (
              <div key={url} className="relative h-24 w-24 rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-slate-200)] group">
                <Image src={url} alt="photo produit" fill className="object-cover" sizes="96px" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            <label className="flex flex-col items-center justify-center h-24 w-24 rounded-[var(--radius-md)] border-2 border-dashed border-[var(--color-slate-200)] hover:border-[var(--color-accent)] cursor-pointer bg-[var(--color-slate-50)] hover:bg-white transition-colors">
              <Upload className="h-5 w-5 text-[var(--color-slate-400)] mb-1" />
              <span className="text-[10px] font-medium text-[var(--color-slate-500)] text-center px-1">
                {uploadingImg ? 'Upload…' : '+ Photo'}
              </span>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploadingImg} />
            </label>
          </div>
          <p className="text-xs text-[var(--color-slate-400)]">
            Téléversez une ou plusieurs photos de qualité. La première image servira de photo de couverture dans le catalogue.
          </p>
        </CardBody>
      </Card>

      {/* Visibilité & Badges */}
      <Card>
        <CardHeader><p className="font-semibold text-[var(--color-navy-900)]">Visibilité & Badges</p></CardHeader>
        <CardBody className="flex flex-col gap-4">
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
              <p className="text-sm font-medium text-[var(--color-navy-900)]">Publié (visible dans le catalogue)</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only peer" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              <div className="w-10 h-6 rounded-full bg-[var(--color-slate-200)] peer-checked:bg-[var(--color-accent)] transition-colors" />
              <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-navy-900)]">Mis en avant sur la boutique</p>
            </div>
          </label>
        </CardBody>
      </Card>

      {/* Bouton de validation */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Annuler
        </Button>
        <Button type="submit" loading={loading} className="bg-amber-400 text-slate-950 hover:bg-amber-500 font-extrabold px-8">
          {mode === 'create' ? 'Publier le produit' : 'Enregistrer les modifications'}
        </Button>
      </div>
    </form>
  )
}
