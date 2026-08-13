import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
  pending:    'En attente',
  confirmed:  'Confirmée',
  shipped:    'Expédiée',
  delivered:  'Livrée',
  cancelled:  'Annulée',
}

const STATUS_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending:    'warning',
  confirmed:  'info',
  shipped:    'info',
  delivered:  'success',
  cancelled:  'danger',
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, total_amount, created_at, order_items(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--color-navy-900)] mb-8">Mes commandes</h1>

      {!orders?.length ? (
        <div className="bg-white rounded-[var(--radius-2xl)] border border-dashed border-[var(--color-slate-300)] p-16 flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 rounded-full bg-[var(--color-slate-100)] flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-[var(--color-slate-400)]" />
          </div>
          <div>
            <p className="font-semibold text-[var(--color-navy-900)]">Aucune commande pour l'instant</p>
            <p className="text-sm text-[var(--color-slate-500)] mt-1">Vos achats apparaîtront ici une fois passés.</p>
          </div>
          <Link href="/" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
            Découvrir les produits
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/commandes/${order.id}`}
              className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-slate-200)] px-5 py-4 flex items-center justify-between hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-card-hover)] transition-all"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-[var(--color-navy-900)]">#{order.order_number}</span>
                  <Badge variant={STATUS_VARIANTS[order.status] ?? 'default'}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </Badge>
                </div>
                <p className="text-sm text-[var(--color-slate-500)]">
                  {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {' · '}
                  {(order.order_items as any)?.[0]?.count ?? 0} article(s)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-[var(--color-navy-900)]">{formatPrice(order.total_amount)}</span>
                <ChevronRight className="h-4 w-4 text-[var(--color-slate-400)]" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
