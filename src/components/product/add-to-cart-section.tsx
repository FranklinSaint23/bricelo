'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import { useLanguage } from '@/components/providers/language-provider'
import { useTheme } from '@/components/providers/theme-provider'
import { cn } from '@/lib/utils'
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
  const [showStickyBar, setShowStickyBar] = useState(false)
  const primaryBtnRef = useRef<HTMLDivElement | null>(null)

  const router = useRouter()
  const addItem  = useCartStore((s) => s.addItem)
  const clearCart = useCartStore((s) => s.clearCart)
  const { t } = useLanguage()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Intersection Observer pour faire apparaître le bouton collant dès que le bouton principal défile hors écran
  useEffect(() => {
    const target = primaryBtnRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Si le bouton principal N'EST PLUS visible à l'écran, afficher la barre collante
        setShowStickyBar(!entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [])

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
      <div ref={primaryBtnRef} className="flex flex-col gap-2.5">
        <Button
          onClick={handleBuyNow}
          disabled={!!outOfStock}
          size="lg"
          className="w-full py-4 text-base font-extrabold shadow-md bg-[var(--color-accent)] hover:bg-[var(--color-gold-600)] text-[var(--color-navy-900)] border-none btn-animate-attention flex items-center justify-center gap-2"
        >
          <ShoppingCart className="h-5 w-5 fill-current" />
          {t.buyNow}
        </Button>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!!outOfStock}
          className="w-full h-12 px-6 text-base rounded-[var(--radius-lg)] font-black transition-all flex items-center justify-center gap-2 border shadow-md !bg-white !text-slate-950 border-slate-300 hover:!bg-slate-100 cursor-pointer"
        >
          <ShoppingCart className="h-4.5 w-4.5 fill-current !text-slate-950" />
          <span className="!text-slate-950 font-black">{added ? t.added : outOfStock ? t.outOfStockBtn : t.addToCart}</span>
        </button>
      </div>

      {/* ── BARRE FLOTTANTE COLLANTE DE BAS DE PAGE (Sticky Bottom Bar) ──
          N'apparaît QUE lorsque le client défile vers le bas et que le bouton principal disparaît de l'écran.
          Disparaît automatiquement dès qu'il remonte au niveau du bouton principal ! ── */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 p-2.5 sm:p-3 sm:px-6 transition-all duration-300 transform shadow-2xl backdrop-blur-md border-t",
          isDark
            ? "bg-[#091122]/95 text-slate-100 border-slate-800"
            : "bg-white/95 text-slate-900 border-slate-200/80",
          showStickyBar ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 sm:gap-3">
          {/* Info Produit Mini (Image + Titre + Prix visibles y compris sur MOBILE) */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {product.images?.[0] && (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded-lg border border-slate-200/50 shrink-0 shadow-2xs bg-slate-100 dark:bg-slate-800"
              />
            )}
            <div className="min-w-0 flex flex-col justify-center">
              <p className={cn("text-[11px] sm:text-xs font-bold truncate max-w-[120px] xs:max-w-[170px] sm:max-w-md leading-tight", isDark ? "text-slate-100" : "text-slate-900")}>
                {product.name}
              </p>
              <p className="text-xs font-black text-amber-500 dark:text-amber-400 leading-tight mt-0.5">
                {unitPrice.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>

          {/* Boutons d'action collants (Bouton Commander maintenant sans toucher sa taille ni sa position) */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!!outOfStock}
              className="hidden sm:flex h-10 px-4 text-xs sm:text-sm rounded-xl font-black transition-all items-center gap-2 !bg-white !text-slate-950 border border-slate-200 shadow-xs hover:!bg-slate-100 cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4 fill-current !text-slate-950" />
              <span className="!text-slate-950">{added ? t.added : t.addToCart}</span>
            </button>

            <Button
              onClick={handleBuyNow}
              disabled={!!outOfStock}
              size="md"
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md btn-animate-attention flex items-center gap-2 border-none"
            >
              <ShoppingCart className="h-4 w-4 fill-current" />
              <span>{t.buyNow}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
