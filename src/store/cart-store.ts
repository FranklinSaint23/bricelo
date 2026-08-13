import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, ProductVariant } from '@/types'

interface CartItem {
  id: string
  product: Product
  variant?: ProductVariant
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem(product, variant, quantity = 1) {
        const itemId = variant ? `${product.id}-${variant.id}` : product.id
        set((state) => {
          const existing = state.items.find((i) => i.id === itemId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            }
          }
          return { items: [...state.items, { id: itemId, product, variant, quantity }] }
        })
      },

      removeItem(id) {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }))
      },

      updateQuantity(id, quantity) {
        if (quantity < 1) return get().removeItem(id)
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }))
      },

      clearCart() {
        set({ items: [] })
      },

      total() {
        return get().items.reduce((sum, item) => {
          const price = item.product.price + (item.variant?.price_adjustment ?? 0)
          return sum + price * item.quantity
        }, 0)
      },

      itemCount() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    { name: 'bricelo-cart' },
  ),
)
