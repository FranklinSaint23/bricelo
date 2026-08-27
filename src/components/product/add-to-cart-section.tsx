'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import { useLanguage } from '@/components/providers/language-provider'
import type { Product, ProductVariant } from '@/types'

interface Props {
  product: Product
  resolvedVariant?: any
  overridePrice?: number
  isAvailable?: boolean
}

export function AddToCartSection({ product, resolvedVariant, overridePrice, isAvailable = true }: Props) {
  const [qty, setQty]                 = useState(1)
  const [selectedMap, setSelectedMap] = useState<Record<string, ProductVariant>>({})
  const [added, setAdded]             = useState(false)
  const router = useRouter()
  const addItem  = useCartStore((s) => s.addItem)
  const clearCart = useCartStore((s) => s.clearCart)
  const { t } = useLanguage()

  const variants  = product.variants ?? []
  const groupedVariants = variants.reduce<Record<string, ProductVariant[]>>((acc, v) => {
    if (!acc[v.name]) acc[v.name] = []
    acc[v.name].push(v)
    return acc
  }, {})

  function toggleVariant(groupName: string, item: ProductVariant) {
    setSelectedMap((prev) => {
      const next = { ...prev }
      if (next[groupName]?.id === item.id) {
        delete next[groupName]
      } else {
        next[groupName] = item
      }
      return next
    })
  }

  // Cumul des ajustements de prix ou variante résolue
  const selectedValues = Object.values(selectedMap)
  const combinedAdjustment = selectedValues.reduce((acc, v) => acc + (v.price_adjustment ?? 0), 0)
  const unitPrice = overridePrice ?? (product.price + combinedAdjustment)

  // Variante finale pour le panier
  const finalVariant: any = resolvedVariant || (selectedValues.length > 0 ? {
    id: selectedValues.map(v => v.id).join('_'),
    product_id: product.id,
    name: selectedValues.map(v => v.name).join(' / '),
    value: selectedValues.map(v => v.value).join(' — '),
    price_adjustment: combinedAdjustment,
    price: unitPrice,
    stock: Math.min(...selectedValues.map(v => v.stock ?? 10)),
    sku: null,
  } : undefined)

  function handleAdd() {
    addItem(product, finalVariant, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function handleBuyNow() {
    clearCart()
    addItem(product, finalVariant, qty)
    router.push('/checkout')
  }

  const outOfStock = product.stock === 0 || selectedValues.some(v => v.stock === 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Variantes multiples (ex: Nombre de places, Épaisseur, Couleur, Taille...) */}
      {Object.entries(groupedVariants).map(([groupName, opts]) => (
        <div key={groupName}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-navy-900)]">
              {groupName}
            </p>
            {selectedMap[groupName] && (
              <span className="text-xs font-bold text-[var(--color-accent)]">
                {selectedMap[groupName].value}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {opts.map((v) => {
              const isSelected = selectedMap[groupName]?.id === v.id
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => toggleVariant(groupName, v)}
                  disabled={v.stock === 0}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[var(--color-navy-900)] text-white border-[var(--color-navy-900)] shadow-sm'
                      : v.stock === 0
                      ? 'border-[var(--color-slate-200)] text-[var(--color-slate-400)] line-through cursor-not-allowed'
                      : 'border-[var(--color-slate-300)] text-[var(--color-navy-900)] hover:border-[var(--color-navy-900)] bg-white'
                  }`}
                >
                  <span>{v.value}</span>
                  {v.price_adjustment !== 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${isSelected ? 'bg-amber-400 text-slate-900' : 'bg-slate-100 text-slate-700'}`}>
                      {v.price_adjustment > 0 ? '+' : ''}{v.price_adjustment.toLocaleString('fr-FR')} F
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Calcul dynamique du prix unitaire selon le cumul des options */}
      {selectedValues.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between">
          <span className="font-medium text-amber-900">Prix selon vos options sélectionnées :</span>
          <span className="font-extrabold text-sm text-[var(--color-navy-900)]">
            {unitPrice.toLocaleString('fr-FR')} FCFA
          </span>
        </div>
      )}

      {/* Quantité */}
      <p className="text-xs font-semibold text-[var(--color-slate-500)] uppercase tracking-wide">{t.quantity}</p>
      <div className="flex items-center border border-[var(--color-slate-200)] rounded-[var(--radius-md)] overflow-hidden w-fit">
        <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-10 w-10 flex items-center justify-center hover:bg-[var(--color-slate-100)] transition-colors">
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-10 text-center text-sm font-medium">{qty}</span>
        <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="h-10 w-10 flex items-center justify-center hover:bg-[var(--color-slate-100)] transition-colors">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Boutons CTA */}
      <div className="flex flex-col gap-2.5">
        <Button
          onClick={handleBuyNow}
          disabled={!!outOfStock}
          size="lg"
          className="w-full py-4 text-base font-extrabold shadow-md bg-[var(--color-accent)] hover:bg-[var(--color-gold-600)] text-[var(--color-navy-900)] border-none btn-animate-attention flex items-center justify-center gap-2"
        >
          <ShoppingCart className="h-5 w-5 fill-current" />
          {t.buyNow}
        </Button>

        <Button
          onClick={handleAdd}
          disabled={!!outOfStock}
          size="lg"
          className="w-full"
          variant={added ? 'secondary' : 'outline'}
        >
          <ShoppingCart className="h-4 w-4" />
          {added ? t.added : outOfStock ? t.outOfStockBtn : t.addToCart}
        </Button>
      </div>
    </div>
  )
}
