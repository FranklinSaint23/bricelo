'use client'

import { useEffect } from 'react'
import { saveToRecentlyViewed } from '@/components/home/recently-viewed'

interface Props {
  product: { id: string; name: string; slug: string; price: number; images?: string[] | null }
}

export function TrackProductView({ product }: Props) {
  useEffect(() => {
    saveToRecentlyViewed({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images?.[0] ?? null,
    })
  }, [product.id])

  return null
}
