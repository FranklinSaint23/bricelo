'use client'

import { useState, useTransition, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, ShoppingBag, PackageSearch, Trash2, Loader2 } from 'lucide-react'
import { Badge, OrderStatusBadge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { useLanguage } from '@/components/providers/language-provider'
import { deleteUserOrder } from '@/app/(account)/commandes/actions'

type Order = {
  id: string
  status: string
  total: number
  created_at: string
  order_items: { count: number }[]
  preview_images: string[]
}

export function OrdersListView({ orders: initialOrders }: { orders: Order[] }) {
  const { lang } = useLanguage()
  const fr = lang === 'fr'
  const [ordersList, setOrdersList] = useState<Order[]>(initialOrders)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const STATUS_LABELS: Record<string, string> = {
    pending:   fr ? 'En attente' : 'Pending',
    confirmed: fr ? 'Confirmée'  : 'Confirmed',
    shipped:   fr ? 'Expédiée'   : 'Shipped',
    delivered: fr ? 'Livrée'     : 'Delivered',
    cancelled: fr ? 'Annulée'    : 'Cancelled',
  }

  const STATUS_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    pending:   'warning',
    confirmed: 'info',
    shipped:   'info',
    delivered: 'success',
    cancelled: 'danger',
  }

  function handleDelete(orderId: string) {
    if (confirm(fr ? 'Voulez-vous vraiment supprimer cette commande de votre historique ?' : 'Are you sure you want to delete this order?')) {
      setDeletingId(orderId)
      startTransition(async () => {
        const res = await deleteUserOrder(orderId)
        if (res.success) {
          setOrdersList((prev) => prev.filter((o) => o.id !== orderId))
        }
        setDeletingId(null)
      })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-navy-900)]">
            {fr ? 'Mes commandes' : 'My orders'}
          </h1>
          <p className="text-xs text-[var(--color-slate-500)] mt-0.5 sm:hidden">
            💡 {fr ? 'Glissez une commande vers la gauche pour la supprimer' : 'Swipe left to delete an order'}
          </p>
        </div>
      </div>

      {ordersList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[var(--color-slate-300)] p-16 flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 rounded-full bg-[var(--color-slate-100)] flex items-center justify-center">
            <PackageSearch className="h-8 w-8 text-[var(--color-slate-400)]" />
          </div>
          <div>
            <p className="font-semibold text-[var(--color-navy-900)]">
              {fr ? "Aucune commande pour l'instant" : 'No orders yet'}
            </p>
            <p className="text-sm text-[var(--color-slate-500)] mt-1">
              {fr ? 'Vos achats apparaîtront ici une fois passés.' : 'Your purchases will appear here once placed.'}
            </p>
          </div>
          <Link href="/" className="text-sm font-semibold text-[var(--color-accent)] hover:underline">
            {fr ? 'Découvrir les produits' : 'Browse products'}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {ordersList.map((order) => (
            <OrderItemCard
              key={order.id}
              order={order}
              isDeleting={deletingId === order.id}
              onDelete={() => handleDelete(order.id)}
              STATUS_LABELS={STATUS_LABELS}
              STATUS_VARIANTS={STATUS_VARIANTS}
              fr={fr}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderItemCard({
  order,
  isDeleting,
  onDelete,
  STATUS_LABELS,
  STATUS_VARIANTS,
  fr,
}: {
  order: Order
  isDeleting: boolean
  onDelete: () => void
  STATUS_LABELS: Record<string, string>
  STATUS_VARIANTS: Record<string, any>
  fr: boolean
}) {
  const [translateX, setTranslateX] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const itemCount = (order.order_items as any)?.[0]?.count ?? 0

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diffX = e.touches[0].clientX - touchStartX.current
    if (diffX < 0) {
      setTranslateX(Math.max(diffX, -90))
    } else {
      setTranslateX(Math.min(diffX, 0))
    }
  }

  function handleTouchEnd() {
    if (translateX < -40) {
      setTranslateX(-80)
    } else {
      setTranslateX(0)
    }
    touchStartX.current = null
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Panneau Supprimer Rouge sur Mobile (Révélé sous la carte lorsqu'on glisse à gauche) */}
      <div className="absolute inset-y-0 right-0 w-24 bg-red-600 rounded-r-2xl flex items-center justify-center p-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          disabled={isDeleting}
          className="w-full h-full flex flex-col items-center justify-center text-white font-bold text-xs gap-1 active:scale-95 transition-transform cursor-pointer"
        >
          {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
          <span>{fr ? 'Supprimer' : 'Delete'}</span>
        </button>
      </div>

      {/* Carte Commande Principale */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(${translateX}px)` }}
        className="bg-white rounded-2xl border border-[var(--color-slate-200)] p-4 sm:p-5 flex items-center gap-4 transition-transform duration-200 ease-out relative z-10 hover:border-[var(--color-slate-300)]"
      >
        <Link href={`/commandes/${order.id}`} className="flex items-center gap-4 flex-1 min-w-0">
          {/* Images preview */}
          <div className="flex -space-x-2 shrink-0">
            {(order.preview_images ?? []).length > 0 ? (
              order.preview_images.slice(0, 3).map((img, i) => (
                <div key={i} className="h-12 w-12 rounded-xl overflow-hidden bg-[var(--color-slate-100)] border-2 border-white relative">
                  <Image src={img} alt="" fill className="object-cover" sizes="48px" />
                </div>
              ))
            ) : (
              <div className="h-12 w-12 rounded-xl bg-[var(--color-slate-100)] border-2 border-white flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-[var(--color-slate-400)]" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-bold text-[var(--color-navy-900)] text-sm">#{order.id.slice(0, 8).toUpperCase()}</span>
              <OrderStatusBadge status={order.status} role="customer" />
            </div>
            <p className="text-xs text-[var(--color-slate-500)]">
              {new Date(order.created_at).toLocaleDateString(fr ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              {' · '}
              {itemCount} {fr ? (itemCount > 1 ? 'articles' : 'article') : (itemCount > 1 ? 'items' : 'item')}
            </p>
          </div>

          {/* Total */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-bold text-[var(--color-navy-900)] text-sm">{formatPrice(order.total)}</span>
            <ChevronRight className="h-4 w-4 text-[var(--color-slate-400)]" />
          </div>
        </Link>

        {/* Bouton Supprimer Ordinateur (visible sur grands écrans sm:) */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          disabled={isDeleting}
          title={fr ? 'Supprimer la commande' : 'Delete order'}
          className="hidden sm:inline-flex items-center justify-center h-9 w-9 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors shrink-0 cursor-pointer"
        >
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin text-red-600" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
