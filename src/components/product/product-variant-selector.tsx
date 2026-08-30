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

  // Pré-sélectionner la 1ère variante active au chargement avec ses prix
  useEffect(() => {
    if (variants && variants.length > 0) {
      const activeV = variants.find((v) => v.status === 'active' && v.stock_quantity > 0) || variants[0]
      if (activeV && activeV.option_values && activeV.option_values.length > 0) {
        const initial: Record<string, string> = {}
        options.forEach((opt) => {
          const matchVal = activeV.option_values?.find((ov) =>
            opt.values.some((val) => val.value === ov.value)
          )
          if (matchVal) {
            initial[opt.name] = matchVal.value
          } else {
            const firstActive = opt.values.find((v) => v.is_active)
            if (firstActive) initial[opt.name] = firstActive.value
          }
        })
        setSelectedValues(initial)
        return
      }
    }

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
  }, [options, variants])

  // Résoudre la variante active d'après les sélections
  const activeVariant = variants.find((v) => {
    if (v.option_values && v.option_values.length > 0) {
      const matchOpts = options.every((opt) => {
        const selectedVal = selectedValues[opt.name]
        if (!selectedVal) return true
        return v.option_values?.some((oVal) => {
          const oValName = (oVal as any).option_name || (oVal as any).name
          const valMatch = oVal.value?.toLowerCase().trim() === selectedVal.toLowerCase().trim()
          if (oValName) {
            return oValName.toLowerCase().trim() === opt.name.toLowerCase().trim() && valMatch
          }
          return valMatch
        })
      })
      if (matchOpts) return true
    }

    const comboStr = `${v.combination_key || ''} ${(v as any).name || ''} ${(v as any).value || ''}`.toLowerCase()
    return options.every((opt) => {
      const selectedVal = selectedValues[opt.name]
      if (!selectedVal) return true
      return comboStr.includes(selectedVal.toLowerCase().trim())
    })
  }) || null

  // Déterminer le prix, le stock, la description et les images effectives
  const effectivePrice = activeVariant ? (activeVariant.price || basePrice) : basePrice
  const effectiveComparePrice = activeVariant ? (activeVariant.compare_at_price ?? null) : baseComparePrice
  const effectiveStock = activeVariant ? (activeVariant.stock_quantity ?? (activeVariant as any).stock ?? baseStock) : baseStock
  const isAvailable = activeVariant
    ? (activeVariant.status !== 'inactive' && (activeVariant.stock_quantity > 0 || (activeVariant as any).stock > 0))
    : baseStock > 0

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
      if (v.option_values && v.option_values.length > 0) {
        const matchOpts = options.every((opt) => {
          const sel = simulated[opt.name]
          if (!sel) return true
          return v.option_values?.some((oVal) => {
            const oValName = (oVal as any).option_name || (oVal as any).name
            const valMatch = oVal.value?.toLowerCase().trim() === sel.toLowerCase().trim()
            if (oValName) {
              return oValName.toLowerCase().trim() === opt.name.toLowerCase().trim() && valMatch
            }
            return valMatch
          })
        })
        if (matchOpts) return true
      }

      const comboStr = `${v.combination_key || ''} ${(v as any).name || ''} ${(v as any).value || ''}`.toLowerCase()
      return options.every((opt) => {
        const sel = simulated[opt.name]
        if (!sel) return true
        return comboStr.includes(sel.toLowerCase().trim())
      })
    })

    if (!matched) return { exists: false, inStock: false }
    const inStock = matched.status !== 'inactive' && (matched.stock_quantity > 0 || (matched as any).stock > 0)
    return { exists: true, inStock }
  }

  return (
    <div className="space-y-4 py-3 border-y border-slate-700/50 my-4">
      {options.map((opt) => {
        const currentSelected = selectedValues[opt.name]

        return (
          <div key={opt.name} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--color-navy-900)] dark:text-slate-100 tracking-wide uppercase">
                {opt.name} :
              </span>
              <span className="font-extrabold text-[var(--color-accent)] dark:text-amber-400">
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
                          ? 'opacity-35 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500 line-through'
                          : isSelected
                          ? 'border-amber-400 bg-amber-400 text-slate-950 font-black shadow-md'
                          : 'border-slate-700/80 bg-slate-900/80 hover:border-slate-500 text-slate-100'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/30 shrink-0"
                        style={{ backgroundColor: hexColor }}
                      />
                      <span>{val.label || val.value}</span>
                      {!avail.inStock && avail.exists && (
                        <span className="text-[10px] text-rose-400 font-bold ml-1">(Épuisé)</span>
                      )}
                      {isSelected && <Check className="h-3.5 w-3.5 text-slate-950 ml-0.5" />}
                    </button>
                  )
                })}
              </div>
            ) : opt.display_type === 'select' ? (
              <select
                value={currentSelected || ''}
                onChange={(e) => handleSelectValue(opt.name, e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-700 bg-slate-900 text-slate-100 font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {!currentSelected && (
                  <option value="" disabled>
                    -- Sélectionnez {opt.name} --
                  </option>
                )}
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
            ) : opt.display_type === 'radio' ? (
              /* Boutons Radio dédiés avec pastilles */
              <div className="flex flex-col gap-2">
                {opt.values.map((val) => {
                  const isSelected = currentSelected === val.value
                  const avail = checkValueAvailability(opt.name, val.value)

                  return (
                    <label
                      key={val.value}
                      onClick={() => {
                        if (avail.exists) handleSelectValue(opt.name, val.value)
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        !avail.exists
                          ? 'opacity-35 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500 line-through'
                          : isSelected
                          ? 'border-amber-400 bg-amber-400 text-slate-950 font-black shadow-md'
                          : 'border-slate-700/80 bg-slate-900/80 hover:border-slate-500 text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? 'border-slate-950 bg-slate-950' : 'border-slate-400 bg-slate-800'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        </div>
                        <span>{val.label || val.value}</span>
                      </div>
                      {!avail.inStock && avail.exists && (
                        <span className="text-[10px] text-rose-400 font-bold ml-1.5">(Épuisé)</span>
                      )}
                    </label>
                  )
                })}
              </div>
            ) : (
              /* Type button (defaut) */
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
                          ? 'opacity-35 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500 line-through'
                          : isSelected
                          ? 'border-amber-400 bg-amber-400 text-slate-950 font-black shadow-md'
                          : 'border-slate-700/80 bg-slate-900/80 hover:border-slate-500 text-slate-100'
                      }`}
                    >
                      <span>{val.label || val.value}</span>
                      {!avail.inStock && avail.exists && (
                        <span className="text-[10px] text-rose-400 font-bold ml-1.5">(Épuisé)</span>
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
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
            <Tag className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-semibold text-slate-200">SKU : {activeVariant.sku || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold">
            <Box className="h-3.5 w-3.5 text-amber-400" />
            {isAvailable ? (
              <span className="text-emerald-400 font-bold">{effectiveStock} unité(s) disponible(s)</span>
            ) : (
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> En rupture de stock
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
