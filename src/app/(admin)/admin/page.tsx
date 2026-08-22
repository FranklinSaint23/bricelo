import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Store, Package, ShoppingBag, CreditCard, TrendingUp, ArrowRight } from 'lucide-react'
import { OrderStatusBadge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'

export default async function AdminDashboard() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) redirect('/login')

  const supabase = await createClient()

  const [
    { count: userCount },
    { count: storeCount },
    { count: productCount },
    { count: orderCount },
    { count: pendingOrderCount },
    { data: recentOrders },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('stores').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders')
      .select('id, total, status, created_at, store:stores(name)')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('payments').select('amount').eq('status', 'success'),
  ])

  const revenue = revenueData?.reduce((s, p) => s + p.amount, 0) ?? 0

  const stats = [
    { icon: Users,       label: 'Utilisateurs',     value: userCount ?? 0,    color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-l-blue-400',    href: '/admin/utilisateurs' },
    { icon: Store,       label: 'Boutiques actives', value: storeCount ?? 0,   color: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-l-violet-400',  href: '/admin/vendeurs' },
    { icon: Package,     label: 'Produits actifs',   value: productCount ?? 0, color: 'text-sky-600',     bg: 'bg-sky-50',     border: 'border-l-sky-400',     href: '/admin/produits' },
    { icon: ShoppingBag, label: 'Commandes',          value: orderCount ?? 0,   color: 'text-orange-600',  bg: 'bg-orange-50',  border: 'border-l-orange-400',  href: '/admin/commandes' },
    { icon: CreditCard,  label: 'Volume paiements',   value: formatPrice(revenue), color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-l-emerald-400', href: '/admin/paiements' },
    { icon: TrendingUp,  label: 'Taux conversion',    value: orderCount && userCount ? `${((orderCount / userCount) * 100).toFixed(1)} %` : '—', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-l-teal-400', href: null },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[var(--color-navy-900)]">Vue globale</h1>
        <p className="text-sm text-[var(--color-slate-500)] mt-0.5">Tableau de bord administrateur BRICELO</p>
      </div>

      {/* Alerte commandes en attente */}
      {(pendingOrderCount ?? 0) > 0 && (
        <Link href="/admin/commandes?status=pending"
          className="flex items-center justify-between gap-3 mb-6 px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 hover:bg-orange-100 transition-colors">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-4 w-4 shrink-0 text-orange-500" />
            <span className="text-sm font-medium">{pendingOrderCount} commande{(pendingOrderCount ?? 0) > 1 ? 's' : ''} en attente de traitement</span>
          </div>
          <ArrowRight className="h-4 w-4 text-orange-400" />
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, color, bg, border, href }) => {
          const card = (
            <div className={`bg-white rounded-xl border border-[var(--color-slate-200)] border-l-4 ${border} p-5 flex items-center gap-4 h-full`}>
              <div className={`h-11 w-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[var(--color-slate-500)] mb-0.5">{label}</p>
                <p className="text-2xl font-bold text-[var(--color-navy-900)] truncate">{value}</p>
              </div>
            </div>
          )
          return href ? (
            <Link key={label} href={href} className="block hover:scale-[1.01] transition-transform">
              {card}
            </Link>
          ) : (
            <div key={label}>{card}</div>
          )
        })}
      </div>

      {/* Dernières commandes */}
      <div className="bg-white rounded-xl border border-[var(--color-slate-200)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-slate-100)] flex items-center justify-between">
          <h2 className="font-semibold text-[var(--color-navy-900)]">Dernières commandes</h2>
          <Link href="/admin/commandes" className="text-xs text-[var(--color-accent)] hover:underline font-medium">
            Voir tout →
          </Link>
        </div>
        {!recentOrders?.length ? (
          <div className="px-5 py-10 text-center">
            <ShoppingBag className="h-8 w-8 text-[var(--color-slate-200)] mx-auto mb-2" />
            <p className="text-sm text-[var(--color-slate-400)]">Aucune commande.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-slate-50)]">
                <tr>
                  {['ID', 'Boutique', 'Date', 'Montant', 'Statut'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-slate-400)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-slate-50)]">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--color-slate-50)] transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-[var(--color-slate-400)]">{order.id.slice(0, 8)}…</td>
                    <td className="px-5 py-3.5 font-medium text-[var(--color-navy-900)]">{(order.store as any)?.name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-[var(--color-slate-500)]">{formatDate(order.created_at)}</td>
                    <td className="px-5 py-3.5 font-bold text-[var(--color-navy-900)]">{formatPrice(order.total)}</td>
                    <td className="px-5 py-3.5"><OrderStatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
