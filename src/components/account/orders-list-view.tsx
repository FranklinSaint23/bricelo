'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, ShoppingBag, PackageSearch } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { useLanguage } from '@/components/providers/language-provider'

type Order = {
  id: string
  status: string
  total: number
  created_at: string
  order_items: { count: number }[]
  preview_images: string[]
}

export function OrdersListView({ orders }: { orders: Order[] }) {
  const { lang } = useLanguage()
  const fr = lang === 'fr'

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

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[var(--color-navy-900)] mb-6">
        {fr ? 'Mes commandes' : 'My orders'}
      </h1>

      {orders.length === 0 ? (
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
          {orders.map((order) => {
            const itemCount = (order.order_items as any)?.[0]?.count ?? 0
            return (
              <Link
                key={order.id}
                href={`/commandes/${order.id}`}
                className="bg-white rounded-2xl border border-[var(--color-slate-200)] p-4 sm:p-5 flex items-center gap-4 hover:border-[var(--color-accent)] hover:shadow-sm transition-all group"
              >
                {/* Product images preview */}
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
                    <Badge variant={STATUS_VARIANTS[order.status] ?? 'default'}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--color-slate-500)]">
                    {new Date(order.created_at).toLocaleDateString(fr ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {' · '}
                    {itemCount} {fr ? (itemCount > 1 ? 'articles' : 'article') : (itemCount > 1 ? 'items' : 'item')}
                  </p>
                </div>

                {/* Total + arrow */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-[var(--color-navy-900)] text-sm">{formatPrice(order.total)}</span>
                  <ChevronRight className="h-4 w-4 text-[var(--color-slate-400)] group-hover:text-[var(--color-accent)] transition-colors" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
