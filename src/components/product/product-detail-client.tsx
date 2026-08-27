'use client'

import { useState } from 'react'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductVariantSelector } from '@/components/product/product-variant-selector'
import { AddToCartSection } from '@/components/product/add-to-cart-section'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { PromoTimer } from '@/components/ui/promo-timer'
import {
  ProductCategoryBadge,
  ProductRatingLine,
  ProductStockStatus,
  ProductGuarantees,
  ProductStoreLink,
  ProductDescriptionHeading,
} from '@/components/product/product-page-client'
import { ProductOption, AdvancedProductVariant } from '@/types/variants'

interface Props {
  product: any
  options: ProductOption[]
  variants: AdvancedProductVariant[]
}

export function ProductDetailClient({ product, options, variants }: Props) {
  const [effectivePrice, setEffectivePrice]                 = useState<number>(product.price)
  const [effectiveComparePrice, setEffectiveComparePrice] = useState<number | null>(product.compare_at_price)
  const [effectiveStock, setEffectiveStock]               = useState<number>(product.stock)
  const [effectiveImages, setEffectiveImages]             = useState<string[]>(product.images || [])
  const [effectiveDescription, setEffectiveDescription]   = useState<string>(product.description || '')
  const [activeVariant, setActiveVariant]                 = useState<AdvancedProductVariant | null>(null)
  const [isAvailable, setIsAvailable]                     = useState<boolean>(product.stock > 0)

  const discount = effectiveComparePrice && effectiveComparePrice > effectivePrice
    ? Math.round(((effectiveComparePrice - effectivePrice) / effectiveComparePrice) * 100)
    : 0

  return (
    <div className="space-y-8">
      {/* Grid Principal Produit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-[var(--radius-2xl)] p-6 sm:p-8 border border-[var(--color-slate-200)] shadow-xs">
        {/* Galerie photos réactive */}
        <ProductGallery images={effectiveImages.length > 0 ? effectiveImages : product.images} name={product.name} />

        <div className="flex flex-col gap-4">
          {/* En-tête */}
          <div>
            {product.category && <ProductCategoryBadge category={product.category as any} />}
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-navy-900)] leading-tight mt-1">{product.name}</h1>
            {product.review_count > 0 && (
              <ProductRatingLine rating={product.rating} count={product.review_count} />
            )}
          </div>

          {/* Prix Réactif */}
          <div className="flex flex-col gap-2 bg-[var(--color-navy-950)] text-white p-4 rounded-xl border border-slate-800 shadow-md">
            <div className="flex items-center flex-wrap gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl font-black text-amber-400">
                {formatPrice(effectivePrice)}
              </span>
              {effectiveComparePrice && effectiveComparePrice > effectivePrice && (
                <>
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-400 line-through decoration-2 opacity-80">
                    {formatPrice(effectiveComparePrice)}
                  </span>
                  <Badge variant="danger" className="shrink-0 text-xs font-bold px-2 py-0.5 shadow-2xs">
                    -{discount}%
                  </Badge>
                </>
              )}
            </div>
            {(effectiveComparePrice && effectiveComparePrice > effectivePrice || product.promo_ends_at || product.promotion_label) && (
              <PromoTimer endsAt={product.promo_ends_at} />
            )}
          </div>

          {/* Sélecteur dynamique de variantes */}
          {options && options.length > 0 && (
            <ProductVariantSelector
              options={options}
              variants={variants}
              basePrice={product.price}
              baseComparePrice={product.compare_at_price}
              baseStock={product.stock}
              productDescription={product.description || ''}
              productImages={product.images || []}
              onVariantSelected={(resolved) => {
                setActiveVariant(resolved.variant)
                setEffectivePrice(resolved.effectivePrice)
                setEffectiveComparePrice(resolved.effectiveComparePrice)
                setEffectiveStock(resolved.effectiveStock)
                setEffectiveImages(resolved.effectiveImages)
                setEffectiveDescription(resolved.effectiveDescription)
                setIsAvailable(resolved.isAvailable)
              }}
            />
          )}

          {/* Statut du stock si pas de variantes */}
          {(!options || options.length === 0) && (
            <div className="flex items-center gap-2 text-sm">
              <ProductStockStatus stock={effectiveStock} />
            </div>
          )}

          {/* Boutons d'ajout au panier & achat rapide */}
          <AddToCartSection
            product={product as any}
            resolvedVariant={activeVariant}
            overridePrice={effectivePrice}
            isAvailable={isAvailable}
          />

          {/* Garanties */}
          <ProductGuarantees />

          {/* Vendeur */}
          {product.store && <ProductStoreLink store={product.store as any} />}
        </div>
      </div>

      {/* Description Réactive */}
      {effectiveDescription && (
        <div className="bg-white rounded-[var(--radius-2xl)] p-6 sm:p-8 border border-[var(--color-slate-200)] shadow-xs">
          <ProductDescriptionHeading />
          <div className="prose prose-sm max-w-none text-[var(--color-slate-700)] leading-relaxed whitespace-pre-line">
            {effectiveDescription}
          </div>
        </div>
      )}
    </div>
  )
}
