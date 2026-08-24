import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'
import { OrderStatusBadge } from '@/components/ui/badge'
import { ValidateCashButton } from '@/components/admin/validate-cash-button'
import { formatPrice, formatDate } from '@/lib/utils'

export default async function VendorOrdersPage() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) redirect('/login')

  const supabase = await createClient()
  const { data: store } = await supabase
    .from('stores')
    .select('id, name')
    .eq('user_id', userId)
    .single()

  if (!store) redirect('/vendeur')

  const { data: orders } = await supabase
    .from('orders')
    .select('id, total, status, payment_method, created_at, shipping_address, order_items(id, quantity, unit_price, total_price, product:products(name, images))')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  const statusLabels: Record<string, string> = {
    pending: 'À emballer',
    confirmed: 'Prêt pour ramassage BRICELO',
    shipped: 'En livraison BRICELO',
    delivered: 'Livré au client',
    cancelled: 'Annulée',
  }

  const counts = Object.fromEntries(
    Object.keys(statusLabels).map((s) => [s, orders?.filter((o) => o.status === s).length ?? 0])
  )

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--color-navy-900)]">Commandes reçues</h1>
        <p className="text-sm text-[var(--color-slate-500)] mt-0.5">{orders?.length ?? 0} commande{(orders?.length ?? 0) > 1 ? 's' : ''} au total • Préparation & Ramassage par BRICELO</p>
      </div>

      {/* Compteurs par statut */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(statusLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[var(--color-slate-200)] text-xs font-medium text-[var(--color-slate-600)] shadow-2xs">
            <span>{label}</span>
            <span className="h-4 w-4 rounded-full bg-[var(--color-slate-100)] flex items-center justify-center text-[10px] font-bold text-[var(--color-navy-900)]">{counts[key]}</span>
          </div>
        ))}
      </div>

      {!orders?.length ? (
        <div className="bg-white rounded-xl border border-dashed border-[var(--color-slate-300)] p-16 flex flex-col items-center gap-3 text-center">
          <ShoppingBag className="h-10 w-10 text-[var(--color-slate-200)]" />
          <p className="font-semibold text-[var(--color-navy-900)]">Aucune commande pour l'instant</p>
          <p className="text-sm text-[var(--color-slate-500)]">Dès que des clients commanderont vos produits, elles apparaîtront ici.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-[var(--color-slate-200)] overflow-hidden shadow-2xs">
              {/* En-tête commande */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[var(--color-slate-100)]">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-[var(--color-slate-400)] font-medium">Commande</p>
                    <p className="font-mono text-sm font-semibold text-[var(--color-navy-900)]">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="h-8 w-px bg-[var(--color-slate-100)]" />
                  <div>
                    <p className="text-xs text-[var(--color-slate-400)]">Date</p>
                    <p className="text-sm text-[var(--color-navy-900)]">{formatDate(order.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {order.payment_method === 'cash' && order.status === 'pending' && (
                    <ValidateCashButton orderId={order.id} />
                  )}
                  <p className="text-lg font-bold text-[var(--color-navy-900)]">{formatPrice(order.total)}</p>
                  <OrderStatusBadge status={order.status} role="vendor" />
                </div>
              </div>

              {/* Articles */}
              {Array.isArray(order.order_items) && order.order_items.length > 0 && (
                <div className="px-5 py-3 flex flex-col gap-2">
                  {order.order_items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-[var(--color-slate-100)] shrink-0 overflow-hidden">
                        {item.product?.images?.[0] && (
                          <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <p className="text-sm text-[var(--color-navy-900)] flex-1 truncate">{item.product?.name ?? '—'}</p>
                      <p className="text-xs text-[var(--color-slate-500)] whitespace-nowrap">× {item.quantity} — {formatPrice(item.total_price)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
