'use client'

import { useState, useEffect } from 'react'
import { Check, ShieldCheck, Tag, Box, AlertCircle, Info } from 'lucide-react'
import { ProductOption, AdvancedProductVariant, ProductOptionValue } from '@/types/variants'
import { formatPrice } from '@/lib/utils'

interface Props {
  options: ProductOption[]
  variants: AdvancedProductVariant[]
  basePrice: number
  baseComparePrice: number | null
  baseStock: number
  productDescription: string
  productImages: string[]
  onVariantSelected: (resolved: {
    variant: AdvancedProductVariant | null
    effectivePrice: number
    effectiveComparePrice: number | null
    effectiveStock: number
    effectiveImages: string[]
    effectiveDescription: string
    isAvailable: boolean
  }) => void
}

export function ProductVariantSelector({
  options,
  variants,
  basePrice,
  baseComparePrice,
  baseStock,
  productDescription,
  productImages,
  onVariantSelected,
}: Props) {
  // Map des sélections courantes par nom d'option (ex: { "Couleur": "Noir", "Stockage": "256 Go" })
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({})

  // Pré-sélectionner la 1ère valeur active pour chaque option au chargement
  useEffect(() => {
    if (options && options.length > 0) {
      const initial: Record<string, string> = {}
      options.forEach((opt) => {
        const firstActive = opt.values.find((v) => v.is_active)
        if (firstActive) {
          initial[opt.name] = firstActive.value
        }
      })
      setSelectedValues(initial)
    }
  }, [options])

  // Résoudre la variante active d'après les sélections
  const activeVariant = variants.find((v) => {
    if (!v.option_values || v.option_values.length === 0) return false
    return options.every((opt) => {
      const selectedVal = selectedValues[opt.name]
      if (!selectedVal) return true
      return v.option_values?.some((oVal) => oVal.value === selectedVal)
    })
  }) || null

  // Déterminer le prix, le stock, la description et les images effectives
  const effectivePrice = activeVariant ? (activeVariant.price || basePrice) : basePrice
  const effectiveComparePrice = activeVariant ? (activeVariant.compare_at_price ?? null) : baseComparePrice
  const effectiveStock = activeVariant ? activeVariant.stock_quantity : baseStock
  const isAvailable = activeVariant ? (activeVariant.status === 'active' && effectiveStock > 0) : baseStock > 0

  const variantImages = activeVariant?.images?.map((i) => i.url) || []
  const effectiveImages = variantImages.length > 0 ? [...variantImages, ...productImages] : productImages
  const effectiveDescription = (activeVariant?.description && activeVariant.description.trim())
    ? activeVariant.description
    : productDescription

  // Informer le composant parent du changement
  useEffect(() => {
    onVariantSelected({
      variant: activeVariant,
      effectivePrice,
      effectiveComparePrice,
      effectiveStock,
      effectiveImages,
      effectiveDescription,
      isAvailable,
    })
  }, [selectedValues, activeVariant])

  if (!options || options.length === 0) {
    return null
  }

  function handleSelectValue(optionName: string, valText: string) {
    setSelectedValues((prev) => ({
      ...prev,
      [optionName]: valText,
    }))
  }

  // Vérifier la faisabilité & le stock d'une valeur au regard des autres sélections actives
  function checkValueAvailability(targetOptName: string, candidateVal: string) {
    const simulated = { ...selectedValues, [targetOptName]: candidateVal }
    
    // Trouver si au moins une variante correspond à la simulation
    const matched = variants.find((v) => {
      if (!v.option_values || v.option_values.length === 0) return false
      return options.every((opt) => {
        const sel = simulated[opt.name]
        if (!sel) return true
        return v.option_values?.some((oVal) => oVal.value === sel)
      })
    })

    if (!matched) return { exists: false, inStock: false }
    const inStock = matched.status === 'active' && matched.stock_quantity > 0
    return { exists: true, inStock }
  }

  return (
    <div className="space-y-4 py-3 border-y border-[var(--color-slate-200)] my-4">
      {options.map((opt) => {
        const currentSelected = selectedValues[opt.name]

        return (
          <div key={opt.name} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--color-navy-900)] tracking-wide uppercase">
                {opt.name} :
              </span>
              <span className="font-semibold text-[var(--color-accent)]">
                {currentSelected || 'Choisissez une option'}
              </span>
            </div>

            {/* Render par display_type */}
            {opt.display_type === 'color' ? (
              <div className="flex flex-wrap items-center gap-2">
                {opt.values.map((val) => {
                  const isSelected = currentSelected === val.value
                  const hexColor = val.metadata?.hex || '#000000'
                  const avail = checkValueAvailability(opt.name, val.value)

                  return (
                    <button
                      key={val.value}
                      type="button"
                      disabled={!avail.exists}
                      onClick={() => handleSelectValue(opt.name, val.value)}
                      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        !avail.exists
                          ? 'opacity-35 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400 line-through'
                          : isSelected
                          ? 'border-[var(--color-navy-900)] bg-slate-100 ring-2 ring-[var(--color-navy-900)]/20 shadow-2xs font-bold'
                          : 'border-[var(--color-slate-300)] hover:border-[var(--color-slate-400)] bg-white'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: hexColor }}
                      />
                      <span>{val.label || val.value}</span>
                      {!avail.inStock && avail.exists && (
                        <span className="text-[10px] text-rose-500 font-bold ml-1">(Épuisé)</span>
                      )}
                      {isSelected && <Check className="h-3.5 w-3.5 text-[var(--color-navy-900)] ml-0.5" />}
                    </button>
                  )
                })}
              </div>
            ) : opt.display_type === 'select' ? (
              <select
                value={currentSelected || ''}
                onChange={(e) => handleSelectValue(opt.name, e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-lg border border-[var(--color-slate-300)] bg-white font-semibold text-[var(--color-navy-900)] focus:outline-none focus:border-[var(--color-navy-900)]"
              >
                {opt.values.map((val) => {
                  const avail = checkValueAvailability(opt.name, val.value)
                  return (
                    <option
                      key={val.value}
                      value={val.value}
                      disabled={!avail.exists}
                    >
                      {val.label || val.value} {!avail.exists ? ' (Indisponible)' : !avail.inStock ? ' (Épuisé)' : ''}
                    </option>
                  )
                })}
              </select>
            ) : (
              /* Type button / radio */
              <div className="flex flex-wrap items-center gap-2">
                {opt.values.map((val) => {
                  const isSelected = currentSelected === val.value
                  const avail = checkValueAvailability(opt.name, val.value)

                  return (
                    <button
                      key={val.value}
                      type="button"
                      disabled={!avail.exists}
                      onClick={() => handleSelectValue(opt.name, val.value)}
                      className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
                        !avail.exists
                          ? 'opacity-35 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400 line-through'
                          : isSelected
                          ? 'border-[var(--color-navy-900)] bg-[var(--color-navy-900)] text-white shadow-xs font-bold'
                          : 'border-[var(--color-slate-300)] hover:border-[var(--color-slate-400)] bg-white text-[var(--color-navy-900)]'
                      }`}
                    >
                      <span>{val.label || val.value}</span>
                      {!avail.inStock && avail.exists && (
                        <span className="text-[10px] text-rose-500 font-bold ml-1.5">(Épuisé)</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Renseignements SKU & Stock de la variante active */}
      {activeVariant && (
        <div className="p-3 rounded-lg bg-[var(--color-slate-100)]/70 text-xs flex flex-wrap items-center justify-between gap-2 border border-[var(--color-slate-200)]">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--color-slate-600)]">
            <Tag className="h-3.5 w-3.5 text-[var(--color-slate-400)]" />
            <span>SKU : {activeVariant.sku || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold">
            <Box className="h-3.5 w-3.5 text-[var(--color-accent)]" />
            {isAvailable ? (
              <span className="text-emerald-700 font-bold">{effectiveStock} unité(s) disponible(s)</span>
            ) : (
              <span className="text-rose-600 font-bold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> En rupture de stock
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
