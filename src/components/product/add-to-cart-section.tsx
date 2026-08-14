'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Minus, Plus, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import { useLanguage } from '@/components/providers/language-provider'
import type { Product, ProductVariant } from '@/types'

interface Props { product: Product }

export function AddToCartSection({ product }: Props) {
  const [qty, setQty]         = useState(1)
  const [variant, setVariant] = useState<ProductVariant | undefined>()
  const [added, setAdded]     = useState(false)
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

  function handleAdd() {
    addItem(product, variant, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function handleBuyNow() {
    clearCart()
    addItem(product, variant, qty)
    router.push('/checkout')
  }

  const outOfStock = product.stock === 0 || (variant && variant.stock === 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Variantes */}
      {Object.entries(groupedVariants).map(([name, opts]) => (
        <div key={name}>
          <p className="text-sm font-medium text-[var(--color-navy-900)] mb-2">{name}</p>
          <div className="flex flex-wrap gap-2">
            {opts.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariant(variant?.id === v.id ? undefined : v)}
                disabled={v.stock === 0}
                className={`px-3 py-1.5 rounded-md text-sm border transition-all ${
                  variant?.id === v.id
                    ? 'bg-[var(--color-navy-900)] text-white border-[var(--color-navy-900)]'
                    : v.stock === 0
                    ? 'border-[var(--color-slate-200)] text-[var(--color-slate-400)] line-through cursor-not-allowed'
                    : 'border-[var(--color-slate-300)] text-[var(--color-navy-900)] hover:border-[var(--color-navy-900)]'
                }`}
              >
                {v.value}
                {v.price_adjustment !== 0 && (
                  <span className="ml-1 text-xs opacity-70">
                    {v.price_adjustment > 0 ? '+' : ''}{v.price_adjustment.toLocaleString()} F
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

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
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={handleAdd}
          disabled={!!outOfStock}
          size="lg"
          className="flex-1"
          variant={added ? 'secondary' : 'primary'}
        >
          <ShoppingCart className="h-4 w-4" />
          {added ? t.added : outOfStock ? t.outOfStockBtn : t.addToCart}
        </Button>

        <Button
          onClick={handleBuyNow}
          disabled={!!outOfStock}
          size="lg"
          className="flex-1"
          variant="outline"
        >
          <Zap className="h-4 w-4" />
          {t.buyNow}
        </Button>
      </div>
    </div>
  )
}
