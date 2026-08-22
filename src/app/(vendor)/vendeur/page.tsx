import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, ShoppingBag, TrendingUp, Star, AlertCircle, Plus, ArrowRight } from 'lucide-react'
import { Badge, OrderStatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDate } from '@/lib/utils'

export default async function VendorDashboard() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) redirect('/login')

  const supabase = await createClient()
  const { data: store } = await supabase
    .from('stores')
    .select('id, name, rating, review_count, is_active')
    .eq('user_id', userId)
    .single()

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <div className="h-16 w-16 rounded-2xl bg-[var(--color-slate-100)] flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-[var(--color-slate-300)]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--color-navy-900)]">Pas encore de boutique</h2>
          <p className="text-sm text-[var(--color-slate-500)] mt-1">Contactez l'administration pour activer votre espace vendeur.</p>
        </div>
      </div>
    )
  }

  const [
    { count: productCount },
    { count: orderCount },
    { data: recentOrders },
    { data: revenueData },
    { count: pendingCount },
  ] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('store_id', store.id).eq('is_active', true),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('store_id', store.id),
    supabase.from('orders').select('id, total, status, created_at').eq('store_id', store.id).order('created_at', { ascending: false }).limit(6),
    supabase.from('orders').select('total').eq('store_id', store.id).in('status', ['delivered', 'shipped', 'confirmed']),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('store_id', store.id).eq('status', 'pending'),
  ])

  const revenue = revenueData?.reduce((s, o) => s + o.total, 0) ?? 0

  const stats = [
    {
      icon: Package,
      label: 'Produits actifs',
      value: productCount ?? 0,
      accent: 'bg-blue-50 text-blue-600',
      border: 'border-l-blue-400',
      link: '/vendeur/produits',
    },
    {
      icon: ShoppingBag,
      label: 'Commandes totales',
      value: orderCount ?? 0,
      accent: 'bg-purple-50 text-purple-600',
      border: 'border-l-purple-400',
      link: '/vendeur/commandes',
    },
    {
      icon: TrendingUp,
      label: 'Chiffre d\'affaires',
      value: formatPrice(revenue),
      accent: 'bg-emerald-50 text-emerald-600',
      border: 'border-l-emerald-400',
      link: null,
    },
    {
      icon: Star,
      label: 'Note boutique',
      value: store.rating > 0 ? `${store.rating.toFixed(1)} / 5` : '—',
      accent: 'bg-amber-50 text-amber-600',
      border: 'border-l-amber-400',
      link: '/vendeur/boutique',
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-xl font-bold text-[var(--color-navy-900)]">{store.name}</h1>
            <Badge variant={store.is_active ? 'success' : 'warning'} size="sm">
              {store.is_active ? 'Active' : 'En attente'}
            </Badge>
          </div>
          <p className="text-sm text-[var(--color-slate-500)]">Bienvenue dans votre espace vendeur</p>
        </div>
        <Button asChild size="md">
          <Link href="/vendeur/produits/nouveau">
            <Plus className="h-4 w-4" /> Ajouter un produit
          </Link>
        </Button>
      </div>

      {/* Alerte commandes en attente */}
      {(pendingCount ?? 0) > 0 && (
        <Link href="/vendeur/commandes?status=pending"
          className="flex items-center justify-between gap-3 mb-6 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-4 w-4 shrink-0 text-amber-600" />
            <span className="text-sm font-medium">{pendingCount} commande{(pendingCount ?? 0) > 1 ? 's' : ''} en attente de traitement</span>
          </div>
          <ArrowRight className="h-4 w-4 text-amber-500" />
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, accent, border, link }) => {
          const card = (
            <div className={`bg-white rounded-xl border border-[var(--color-slate-200)] border-l-4 ${border} p-4 flex items-center gap-4 h-full`}>
              <div className={`h-10 w-10 rounded-xl ${accent.split(' ')[0]} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${accent.split(' ')[1]}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[var(--color-slate-500)] mb-0.5">{label}</p>
                <p className="text-xl font-bold text-[var(--color-navy-900)] truncate">{value}</p>
              </div>
            </div>
          )
          return link ? (
            <Link key={label} href={link} className="block hover:scale-[1.02] transition-transform">
              {card}
            </Link>
          ) : (
            <div key={label}>{card}</div>
          )
        })}
      </div>

      {/* Commandes récentes */}
      <div className="bg-white rounded-xl border border-[var(--color-slate-200)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-slate-100)] flex items-center justify-between">
          <h2 className="font-semibold text-[var(--color-navy-900)]">Commandes récentes</h2>
          <Link href="/vendeur/commandes" className="text-xs text-[var(--color-accent)] hover:underline font-medium">
            Voir tout →
          </Link>
        </div>
        {!recentOrders?.length ? (
          <div className="px-5 py-10 text-center">
            <ShoppingBag className="h-8 w-8 text-[var(--color-slate-200)] mx-auto mb-2" />
            <p className="text-sm text-[var(--color-slate-400)]">Aucune commande pour l'instant.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-slate-50)]">
                <tr>
                  {['ID commande', 'Date', 'Montant', 'Statut'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-slate-400)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-slate-50)]">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--color-slate-50)] transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-[var(--color-slate-500)]">{order.id.slice(0, 8)}…</td>
                    <td className="px-5 py-3.5 text-[var(--color-slate-600)]">{formatDate(order.created_at)}</td>
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
