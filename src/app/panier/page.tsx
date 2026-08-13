'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, itemCount } = useCartStore()
  const count = itemCount()
  const subtotal = total()
  const shipping = subtotal > 0 ? 2000 : 0
  const grandTotal = subtotal + shipping

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[var(--color-slate-100)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-[var(--color-navy-900)] mb-6">
            Mon panier {count > 0 && <span className="text-[var(--color-slate-500)] font-normal text-lg">({count} article{count > 1 ? 's' : ''})</span>}
          </h1>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[var(--radius-2xl)] border border-[var(--color-slate-200)]">
              <ShoppingBag className="h-16 w-16 text-[var(--color-slate-300)] mb-4" />
              <h2 className="text-lg font-semibold text-[var(--color-navy-900)]">Votre panier est vide</h2>
              <p className="text-sm text-[var(--color-slate-500)] mt-1 mb-6">Découvrez nos produits et commencez vos achats.</p>
              <Button asChild size="lg">
                <Link href="/catalogue">Parcourir le catalogue</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Articles */}
              <div className="flex-1 flex flex-col gap-3">
                {items.map((item) => {
                  const price = item.product.price + (item.variant?.price_adjustment ?? 0)
                  return (
                    <div key={item.id} className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-slate-200)] p-4 flex gap-4">
                      <Link href={`/produit/${item.product.slug}`} className="relative h-20 w-20 shrink-0 rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-slate-100)]">
                        {item.product.images?.[0] && (
                          <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="80px" />
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/produit/${item.product.slug}`} className="text-sm font-semibold text-[var(--color-navy-900)] hover:text-[var(--color-accent)] line-clamp-2">
                          {item.product.name}
                        </Link>
                        {item.variant && (
                          <p className="text-xs text-[var(--color-slate-500)] mt-0.5">{item.variant.name}: {item.variant.value}</p>
                        )}
                        <p className="text-base font-bold text-[var(--color-navy-900)] mt-1">{formatPrice(price)}</p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button onClick={() => removeItem(item.id)} className="text-[var(--color-slate-400)] hover:text-[var(--color-danger)] transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="flex items-center border border-[var(--color-slate-200)] rounded-md overflow-hidden">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="h-8 w-8 flex items-center justify-center hover:bg-[var(--color-slate-100)] transition-colors">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-8 w-8 flex items-center justify-center hover:bg-[var(--color-slate-100)] transition-colors">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Récapitulatif */}
              <div className="lg:w-80 shrink-0">
                <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-slate-200)] p-5 sticky top-20">
                  <h2 className="font-bold text-[var(--color-navy-900)] mb-4">Récapitulatif</h2>
                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex justify-between text-[var(--color-slate-600)]">
                      <span>Sous-total</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[var(--color-slate-600)]">
                      <span>Livraison estimée</span>
                      <span>{formatPrice(shipping)}</span>
                    </div>
                    <hr className="border-[var(--color-slate-200)]" />
                    <div className="flex justify-between font-bold text-base text-[var(--color-navy-900)]">
                      <span>Total</span>
                      <span>{formatPrice(grandTotal)}</span>
                    </div>
                  </div>
                  <Button asChild className="w-full mt-5" size="lg">
                    <Link href="/checkout">
                      Commander <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Link href="/catalogue" className="block text-center text-sm text-[var(--color-slate-500)] hover:text-[var(--color-accent)] mt-3 transition-colors">
                    Continuer mes achats
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
