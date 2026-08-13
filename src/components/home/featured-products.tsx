import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '@/components/product/product-card'
import type { Product } from '@/types'

interface FeaturedProductsProps {
  products: Partial<Product>[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (!products.length) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-navy-900)]">Produits en vedette</h2>
          <p className="text-sm text-[var(--color-slate-500)] mt-0.5">Sélectionnés pour vous</p>
        </div>
        <Link href="/catalogue" className="flex items-center gap-1 text-sm text-[var(--color-accent)] font-medium hover:underline">
          Voir plus <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product as Product} />
        ))}
      </div>
    </section>
  )
}
