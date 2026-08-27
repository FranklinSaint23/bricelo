'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Layers, Sparkles, AlertCircle, Edit3, Image as ImageIcon, Check, X, SlidersHorizontal, ArrowRight, ShieldCheck, Upload, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { DisplayType, ProductOption, ProductOptionValue, AdvancedProductVariant, VariantStatus, VariantImage } from '@/types/variants'
import { WORLD_PRODUCT_PRESETS } from '@/lib/product-presets'
import { generateVariantMatrix, MAX_VARIANTS_LIMIT } from '@/lib/variant-generator'

interface Props {
  productName: string
  basePrice: number
  baseStock: number
  initialOptions?: ProductOption[]
  initialVariants?: AdvancedProductVariant[]
  onChangeOptions: (options: ProductOption[]) => void
  onChangeVariants: (variants: AdvancedProductVariant[]) => void
}

export function VariantMatrixEditor({
  productName,
  basePrice,
  baseStock,
  initialOptions = [],
  initialVariants = [],
  onChangeOptions,
  onChangeVariants,
}: Props) {
  // Preset sélectionné
  const [selectedPresetId, setSelectedPresetId] = useState<string>('custom_generic')

  // Options et leurs valeurs
  const [options, setOptions] = useState<ProductOption[]>(
    initialOptions.length > 0
      ? initialOptions
      : [
          {
            name: 'Couleur',
            display_type: 'color',
            position: 0,
            required: true,
            values: [
              { value: 'Noir', label: 'Noir', position: 0, is_active: true, metadata: { hex: '#000000' } },
              { value: 'Bleu', label: 'Bleu', position: 1, is_active: true, metadata: { hex: '#0000ff' } },
            ],
          },
        ]
  )

  // Variantes SKU générées
  const [variants, setVariants] = useState<AdvancedProductVariant[]>(initialVariants)

  // Modal d'édition détaillée de variante
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null)
  const [tempVariantDesc, setTempVariantDesc]         = useState('')
  const [tempVariantImages, setTempVariantImages]     = useState<VariantImage[]>([])
  const [uploadingVariantImg, setUploadingVariantImg] = useState(false)

  // Outils d'action en masse (Bulk Apply)
  const [bulkPrice, setBulkPrice] = useState('')
  const [bulkStock, setBulkStock] = useState('')

  // Récalcul automatique de la matrice de variantes dès que les options changent
  useEffect(() => {
    const { variants: newMatrix } = generateVariantMatrix(options, basePrice, baseStock, productName, variants)
    setVariants(newMatrix)
    onChangeOptions(options)
    onChangeVariants(newMatrix)
  }, [options, basePrice, baseStock, productName])

  // Application d'un preset universel de produit du monde
  function applyPreset(presetId: string) {
    setSelectedPresetId(presetId)
    const preset = WORLD_PRODUCT_PRESETS.find((p) => p.id === presetId)
    if (!preset || preset.defaultOptions.length === 0) return

    const newOptions: ProductOption[] = preset.defaultOptions.map((opt, optIdx) => ({
      name: opt.name,
      display_type: opt.display_type,
      position: optIdx,
      required: true,
      values: opt.defaultValues.map((val, valIdx) => ({
        value: val.value,
        label: val.label ?? val.value,
        position: valIdx,
        is_active: true,
        metadata: val.hex ? { hex: val.hex } : null,
      })),
    }))

    setOptions(newOptions)
  }

  // Ajouter une option
  function addOption() {
    const newOpt: ProductOption = {
      name: `Nouvelle Option ${options.length + 1}`,
      display_type: 'button',
      position: options.length,
      required: true,
      values: [
        { value: 'Option 1', label: 'Option 1', position: 0, is_active: true },
        { value: 'Option 2', label: 'Option 2', position: 1, is_active: true },
      ],
    }
    setOptions([...options, newOpt])
  }

  // Supprimer une option
  function removeOption(index: number) {
    setOptions(options.filter((_, i) => i !== index))
  }

  // Mettre à jour le nom ou le type d'affichage d'une option
  function updateOption(index: number, field: keyof ProductOption, value: any) {
    const updated = [...options]
    updated[index] = { ...updated[index], [field]: value }
    setOptions(updated)
  }

  // Ajouter une valeur à une option
  function addOptionValue(optIdx: number, valText: string = '', hexColor: string = '') {
    if (!valText.trim()) return
    const updated = [...options]
    const opt = updated[optIdx]
    const newVal: ProductOptionValue = {
      value: valText.trim(),
      label: valText.trim(),
      position: opt.values.length,
      is_active: true,
      metadata: hexColor ? { hex: hexColor } : null,
    }
    opt.values.push(newVal)
    setOptions(updated)
  }

  // Supprimer une valeur d'option
  function removeOptionValue(optIdx: number, valIdx: number) {
    const updated = [...options]
    updated[optIdx].values.splice(valIdx, 1)
    setOptions(updated)
  }

  // Mise à jour d'un champ de variante dans la table (SKU, Prix, Stock, Status)
  function updateVariant(varIdx: number, field: keyof AdvancedProductVariant, val: any) {
    const updated = [...variants]
    updated[varIdx] = { ...updated[varIdx], [field]: val }
    setVariants(updated)
    onChangeVariants(updated)
  }

  // Appliquer le prix en masse
  function applyBulkPrice() {
    const p = parseFloat(bulkPrice)
    if (isNaN(p) || p < 0) return
    const updated = variants.map((v) => ({ ...v, price: p }))
    setVariants(updated)
    onChangeVariants(updated)
    setBulkPrice('')
  }

  // Appliquer le stock en masse
  function applyBulkStock() {
    const s = parseInt(bulkStock, 10)
    if (isNaN(s) || s < 0) return
    const updated = variants.map((v) => ({ ...v, stock_quantity: s }))
    setVariants(updated)
    onChangeVariants(updated)
    setBulkStock('')
  }

  // Calcul du nombre théorique de variantes
  const { totalCount, excedesLimit } = generateVariantMatrix(options, basePrice, baseStock, productName, variants)

  return (
    <div className="space-y-6">
      {/* ── 1. Sélecteur de Type de Produit (Presets du monde) ── */}
      <Card className="border-slate-800 shadow-xs bg-slate-900 text-white">
        <CardHeader className="bg-[var(--color-navy-950)] text-white py-3.5 px-4 rounded-t-xl flex flex-row items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-bold tracking-wide">Type de Produit & Modèle Prédéfini</h3>
          </div>
          <span className="text-[11px] text-white/60">Génération automatique des variantes</span>
        </CardHeader>
        <CardBody className="p-4 space-y-3">
          <p className="text-xs text-slate-300">
            Choisissez la catégorie du produit pour pré-remplir les critères de variantes usuels (*Smartphones, Mode, Meubles, Électroménager, Parfums...*) ou créez vos propres critères sur-mesure.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {WORLD_PRODUCT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`text-left p-3 rounded-xl border text-xs transition-all ${
                  selectedPresetId === preset.id
                    ? 'border-amber-400 bg-amber-400 text-slate-950 font-extrabold shadow-md'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-600 text-slate-100'
                }`}
              >
                <p className={`font-bold ${selectedPresetId === preset.id ? 'text-slate-950' : 'text-slate-100'}`}>
                  {preset.categoryLabel}
                </p>
                <p className={`text-[10px] line-clamp-1 mt-0.5 ${selectedPresetId === preset.id ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* ── 2. Configuration des Critères / Options ── */}
      <Card className="border-slate-800 shadow-xs bg-slate-900 text-white">
        <CardHeader className="bg-[var(--color-navy-950)] py-3 px-4 flex flex-row items-center justify-between border-b border-slate-800 rounded-t-xl text-white">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white">Critères & Options du Produit</h4>
          </div>
          <Button type="button" size="sm" onClick={addOption} className="h-8 text-xs gap-1 bg-amber-400 text-slate-950 font-bold hover:bg-amber-500">
            <Plus className="h-3.5 w-3.5" /> Ajouter un critère
          </Button>
        </CardHeader>
        <CardBody className="p-4 space-y-4">
          {options.map((opt, optIdx) => (
            <div key={optIdx} className="p-4 rounded-xl border border-slate-700/80 bg-slate-950 space-y-3 shadow-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-xs font-black uppercase tracking-wider text-amber-400 mb-1">
                    Nom du critère
                  </label>
                  <Input
                    value={opt.name}
                    onChange={(e) => updateOption(optIdx, 'name', e.target.value)}
                    placeholder="ex: Couleur, Taille, RAM..."
                    className="h-9 text-xs bg-slate-900 text-white border-slate-700 font-semibold focus:border-amber-400 placeholder:text-slate-500"
                  />
                </div>
                <div className="w-44">
                  <label className="block text-xs font-black uppercase tracking-wider text-amber-400 mb-1">
                    Affichage client
                  </label>
                  <select
                    value={opt.display_type}
                    onChange={(e) => updateOption(optIdx, 'display_type', e.target.value as DisplayType)}
                    className="w-full h-9 px-2 text-xs border border-slate-700 rounded-lg bg-slate-900 text-white font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="color">Boutons Couleur (Swatches)</option>
                    <option value="button">Boutons Texte</option>
                    <option value="select">Liste déroulante</option>
                    <option value="radio">Boutons Radio</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeOption(optIdx)}
                  className="mt-5 p-2 text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                  title="Supprimer ce critère"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Liste des valeurs du critère */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-amber-400 mb-2">
                  Valeurs de {opt.name}
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {opt.values.map((val, valIdx) => (
                    <div
                      key={valIdx}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs font-bold text-slate-100 shadow-2xs"
                    >
                      {opt.display_type === 'color' && (
                        <input
                          type="color"
                          value={val.metadata?.hex || '#000000'}
                          onChange={(e) => {
                            const updated = [...options]
                            updated[optIdx].values[valIdx].metadata = { hex: e.target.value }
                            setOptions(updated)
                          }}
                          className="w-4 h-4 rounded-full border-0 p-0 cursor-pointer"
                        />
                      )}
                      <span className="font-bold text-slate-100">{val.value}</span>
                      <button
                        type="button"
                        onClick={() => removeOptionValue(optIdx, valIdx)}
                        className="text-slate-400 hover:text-rose-400 transition-colors ml-0.5"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Formulaire d'ajout rapide de valeur */}
                  <QuickAddValueForm
                    onAdd={(val, hex) => addOptionValue(optIdx, val, hex)}
                    isColor={opt.display_type === 'color'}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* ── 3. Synthèse & Génération de la Matrice ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[var(--color-navy-950)] border border-amber-400/50 text-white shadow-md">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <span>
            Cette configuration générera <strong className="text-amber-400 text-sm font-black">{variants.length} variante(s)/SKU</strong> commerciale(s) indépendante(s).
          </span>
        </div>
        {excedesLimit && (
          <div className="flex items-center gap-1.5 text-xs text-rose-300 font-bold bg-rose-950/80 border border-rose-700/60 px-3 py-1 rounded-md">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>Limite de sécurité dépassée (max {MAX_VARIANTS_LIMIT} variantes). Réduisez les critères.</span>
          </div>
        )}
      </div>

      {/* ── 4. Tableau de Gestion des Variantes (SKU Matrix Table) ── */}
      {variants.length > 0 && (
        <Card className="border-slate-800 shadow-xs bg-slate-900 text-white">
          <CardHeader className="bg-[var(--color-navy-950)] text-white py-3 px-4 rounded-t-xl flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white">Matrice des Variantes & Stocks ({variants.length})</h4>

            {/* Actions en masse */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 p-1.5 rounded-lg">
                <Input
                  type="number"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  placeholder="Prix FCFA..."
                  className="h-8 text-xs w-28 bg-slate-950 text-white border-slate-700 font-semibold focus:border-amber-400"
                />
                <Button type="button" size="sm" onClick={applyBulkPrice} className="h-8 text-xs bg-amber-400 hover:bg-amber-500 text-slate-950 font-black shadow-2xs px-3 rounded-md">
                  Prix Tous
                </Button>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 p-1.5 rounded-lg">
                <Input
                  type="number"
                  value={bulkStock}
                  onChange={(e) => setBulkStock(e.target.value)}
                  placeholder="Stock..."
                  className="h-8 text-xs w-20 bg-slate-950 text-white border-slate-700 font-semibold focus:border-amber-400"
                />
                <Button type="button" size="sm" onClick={applyBulkStock} className="h-8 text-xs bg-slate-100 hover:bg-white text-slate-950 font-black shadow-2xs px-3 rounded-md">
                  Stock Tous
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--color-navy-950)] border-b border-slate-800 text-amber-400 font-extrabold uppercase text-[10px]">
                  <th className="py-3 px-3">Combinaison</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Prix (FCFA)</th>
                  <th className="py-3 px-3">Prix Barré</th>
                  <th className="py-3 px-3">Stock</th>
                  <th className="py-3 px-3">Statut</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900">
                {variants.map((v, varIdx) => (
                  <tr key={varIdx} className={v.status === 'inactive' ? 'bg-slate-950/80 opacity-50' : 'hover:bg-slate-800/80 transition-colors'}>
                    <td className="py-2.5 px-3 font-bold text-slate-100">
                      {v.option_values?.map((o) => o.value).join(' / ') || 'Par défaut'}
                    </td>
                    <td className="py-2.5 px-3">
                      <Input
                        value={v.sku || ''}
                        onChange={(e) => updateVariant(varIdx, 'sku', e.target.value)}
                        className="h-8 text-xs w-32 font-mono uppercase bg-slate-950 text-white border-slate-700"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <Input
                        type="number"
                        value={v.price || 0}
                        onChange={(e) => updateVariant(varIdx, 'price', parseFloat(e.target.value) || 0)}
                        className="h-8 text-xs w-28 font-bold bg-slate-950 text-amber-400 border-slate-700"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <Input
                        type="number"
                        value={v.compare_at_price || ''}
                        onChange={(e) => updateVariant(varIdx, 'compare_at_price', e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="Optionnel"
                        className="h-8 text-xs w-24 bg-slate-950 text-slate-300 border-slate-700"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <Input
                        type="number"
                        value={v.stock_quantity || 0}
                        onChange={(e) => updateVariant(varIdx, 'stock_quantity', parseInt(e.target.value, 10) || 0)}
                        className="h-8 text-xs w-20 font-bold bg-slate-950 text-emerald-400 border-slate-700"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={v.status}
                        onChange={(e) => updateVariant(varIdx, 'status', e.target.value as VariantStatus)}
                        className="h-8 text-xs w-28 bg-slate-950 text-white border border-slate-700 rounded px-1.5 font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="active">Actif</option>
                        <option value="inactive">Inactif</option>
                        <option value="out_of_stock">Rupture</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          setEditingVariantIndex(varIdx)
                          setTempVariantDesc(v.description || '')
                          setTempVariantImages(v.images || [])
                        }}
                        className="h-8 px-2.5 text-xs gap-1.5 bg-amber-400 text-slate-950 font-extrabold hover:bg-amber-500 shadow-xs"
                        title="Images & Description spécifique"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Édit
                        {v.images && v.images.length > 0 && (
                          <span className="ml-1 bg-slate-950 text-amber-400 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                            {v.images.length}
                          </span>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {/* ── Modal d'édition avancée d'une variante ── */}
      {editingVariantIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-[var(--color-navy-950)] text-white px-5 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Édition de Variante Spécifique</h3>
                <p className="text-[11px] text-[var(--color-accent)] font-semibold">
                  {variants[editingVariantIndex]?.option_values?.map((o) => o.value).join(' / ')}
                </p>
              </div>
              <button onClick={() => setEditingVariantIndex(null)} className="p-1 hover:bg-white/10 rounded-md">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Upload d'images spécifiques pour la variante */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-slate-700)] mb-1">
                  Images spécifiques à cette variante (Couleur / Modèle)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tempVariantImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300 group">
                      <img src={img.url} alt="Variante" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setTempVariantImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-90 hover:opacity-100"
                        title="Supprimer cette image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 hover:border-slate-400 flex flex-col items-center justify-center gap-1 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    {uploadingVariantImg ? (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                    ) : (
                      <>
                        <Upload className="h-4 w-4 text-slate-500" />
                        <span className="text-[9px] font-bold text-slate-600">Ajouter</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={async (e) => {
                        const files = Array.from(e.target.files ?? [])
                        if (!files.length) return
                        setUploadingVariantImg(true)
                        const supabase = createClient()
                        try {
                          for (const file of files) {
                            const ext = file.name.split('.').pop()
                            const path = `variant-${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
                            let bucketName = 'product-images'

                            let { error: uploadErr } = await supabase.storage.from(bucketName).upload(path, file)
                            if (uploadErr && uploadErr.message?.toLowerCase().includes('bucket not found')) {
                              bucketName = 'products'
                              const res = await supabase.storage.from(bucketName).upload(path, file)
                              uploadErr = res.error
                            }

                            if (uploadErr) throw uploadErr

                            const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(path)
                            setTempVariantImages((prev) => [...prev, { url: publicUrl, position: prev.length }])
                          }
                        } catch (err: any) {
                          alert(err.message || 'Erreur lors de l’envoi de l’image')
                        } finally {
                          setUploadingVariantImg(false)
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  Si aucune image spécifique n'est ajoutée, les visuels généraux du produit principal seront utilisés.
                </p>
              </div>

              {/* Description spécifique */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-slate-700)] mb-1">
                  Description spécifique à cette variante (Optionnel)
                </label>
                <textarea
                  value={tempVariantDesc}
                  onChange={(e) => setTempVariantDesc(e.target.value)}
                  placeholder="Si vide, la description générale du produit sera automatiquement utilisée par le site."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-slate-300)] focus:border-[var(--color-navy-900)] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-slate-200)]">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingVariantIndex(null)}>
                  Annuler
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const updated = [...variants]
                    updated[editingVariantIndex] = {
                      ...updated[editingVariantIndex],
                      description: tempVariantDesc,
                      images: tempVariantImages,
                    }
                    setVariants(updated)
                    onChangeVariants(updated)
                    setEditingVariantIndex(null)
                  }}
                  className="bg-[var(--color-navy-900)] hover:bg-[var(--color-navy-950)] text-white font-semibold"
                >
                  Enregistrer la variante
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Composant formulaire d'ajout rapide de valeur (sans balise <form> imbriquée)
function QuickAddValueForm({ onAdd, isColor }: { onAdd: (val: string, hex: string) => void; isColor: boolean }) {
  const [val, setVal] = useState('')
  const [hex, setHex] = useState('#000000')

  function handleAddAction(e?: React.SyntheticEvent) {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (val.trim()) {
      onAdd(val.trim(), isColor ? hex : '')
      setVal('')
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      {isColor && (
        <input
          type="color"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          className="w-5 h-5 rounded-full border-0 p-0 cursor-pointer shrink-0"
        />
      )}
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            e.stopPropagation()
            handleAddAction(e)
          }
        }}
        placeholder="+ Valeur (Entrée)"
        className="h-8 text-xs px-2.5 rounded-lg border border-dashed border-slate-600 focus:border-amber-400 focus:outline-none w-36 bg-slate-900 text-white font-semibold placeholder:text-slate-500"
      />
      <button
        type="button"
        onClick={handleAddAction}
        className="h-8 w-8 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-xs transition-colors shrink-0 flex items-center justify-center"
      >
        +
      </button>
    </div>
  )
}
