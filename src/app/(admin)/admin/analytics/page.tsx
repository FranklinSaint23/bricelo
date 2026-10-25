import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import {
  TrendingUp, ShoppingBag, Users, CreditCard, Package, Store,
  ArrowUpRight, ArrowDownRight, Calendar, BarChart3, PieChart,
  Truck, CheckCircle2, Clock, AlertCircle, Sparkles, DollarSign,
  ChevronRight, RefreshCw, Smartphone
} from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import { OrderStatusBadge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) redirect('/login')

  const supabase = await createClient()

  // 1. Récupération des données globales
  const [
    { data: ordersData },
    { data: paymentsData },
    { data: usersData },
    { data: storesData },
    { data: productsData },
    { data: orderItemsData },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id, total, status, created_at, shipping_address, user:users(full_name, email)')
      .order('created_at', { ascending: false }),
    supabase
      .from('payments')
      .select('id, amount, status, provider, created_at, metadata')
      .order('created_at', { ascending: false }),
    supabase
      .from('users')
      .select('id, role, created_at'),
    supabase
      .from('stores')
      .select('id, name, is_active, created_at'),
    supabase
      .from('products')
      .select('id, name, slug, price, images, stock, is_active')
      .eq('is_active', true),
    supabase
      .from('order_items')
      .select('id, order_id, product_id, quantity, unit_price, total_price, snapshot'),
  ])

  const orders = ordersData ?? []
  const payments = paymentsData ?? []
  const users = usersData ?? []
  const stores = storesData ?? []
  const products = productsData ?? []
  const orderItems = orderItemsData ?? []

  // 2. Calculs Métriques Financières
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
  const averageBasket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  const successfulPayments = payments.filter((p) => p.status === 'success')
  const collectedRevenue = successfulPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  // 3. Calculs Utilisateurs & Vendeurs
  const customersCount = users.filter((u) => u.role === 'customer').length
  const vendorsCount = users.filter((u) => u.role === 'vendor').length
  const activeStoresCount = stores.filter((s) => s.is_active).length

  // 4. Graphique des 7 derniers jours (Commandes & CA journalier)
  const daysMap = new Map<string, { label: string; dateStr: string; count: number; total: number }>()
  const now = new Date()

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(now.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
    daysMap.set(key, { label: dayLabel, dateStr: key, count: 0, total: 0 })
  }

  orders.forEach((o) => {
    if (!o.created_at) return
    const key = o.created_at.split('T')[0]
    if (daysMap.has(key)) {
      const entry = daysMap.get(key)!
      entry.count += 1
      entry.total += Number(o.total) || 0
    }
  })

  const dailyChart = Array.from(daysMap.values())
  const maxDayRevenue = Math.max(...dailyChart.map((d) => d.total), 1)

  // 5. Répartition par Statut de Commande
  const statusCounts: Record<string, number> = {
    delivered: 0,
    shipped: 0,
    preparing: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
  }

  orders.forEach((o) => {
    if (statusCounts[o.status] !== undefined) {
      statusCounts[o.status] += 1
    } else {
      statusCounts.pending = (statusCounts.pending || 0) + 1
    }
  })

  const statusList = [
    { label: 'Livrées', status: 'delivered', count: statusCounts.delivered, color: 'bg-emerald-500', barBg: 'bg-emerald-100 dark:bg-emerald-950/60' },
    { label: 'Expédiées / En cours', status: 'shipped', count: statusCounts.shipped + statusCounts.preparing, color: 'bg-sky-500', barBg: 'bg-sky-100 dark:bg-sky-950/60' },
    { label: 'Confirmées', status: 'confirmed', count: statusCounts.confirmed, color: 'bg-blue-500', barBg: 'bg-blue-100 dark:bg-blue-950/60' },
    { label: 'En attente', status: 'pending', count: statusCounts.pending, color: 'bg-amber-500', barBg: 'bg-amber-100 dark:bg-amber-950/60' },
    { label: 'Annulées', status: 'cancelled', count: statusCounts.cancelled, color: 'bg-rose-500', barBg: 'bg-rose-100 dark:bg-rose-950/60' },
  ]

  // 6. Répartition des Modes de Paiement
  const paymentMethodCounts: Record<string, { count: number; total: number }> = {
    orange_money: { count: 0, total: 0 },
    mtn_momo: { count: 0, total: 0 },
    cinetpay: { count: 0, total: 0 },
    cash: { count: 0, total: 0 },
  }

  payments.forEach((p) => {
    const method = (p.metadata as any)?.payment_method || (p.provider === 'cinetpay' ? 'cinetpay' : 'orange_money')
    const amt = Number(p.amount) || 0
    if (paymentMethodCounts[method]) {
      paymentMethodCounts[method].count += 1
      paymentMethodCounts[method].total += amt
    } else {
      paymentMethodCounts.cinetpay.count += 1
      paymentMethodCounts.cinetpay.total += amt
    }
  })

  // 7. Top Produits vendus (ou consultés)
  const productSalesMap = new Map<string, { id: string; name: string; slug: string; image: string; price: number; unitsSold: number; totalGenerated: number }>()

  orderItems.forEach((item) => {
    const pId = item.product_id
    const snapshot = item.snapshot as any
    const name = snapshot?.name || 'Produit'
    const image = snapshot?.images?.[0] || '/placeholder.png'
    const price = Number(item.unit_price) || 0
    const qty = Number(item.quantity) || 1
    const total = Number(item.total_price) || (price * qty)

    if (productSalesMap.has(pId)) {
      const p = productSalesMap.get(pId)!
      p.unitsSold += qty
      p.totalGenerated += total
    } else {
      productSalesMap.set(pId, {
        id: pId,
        name,
        slug: snapshot?.slug || '',
        image,
        price,
        unitsSold: qty,
        totalGenerated: total,
      })
    }
  })

  const topProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5)

  // 8. Répartition Géographique (Villes de livraison)
  const cityCounts: Record<string, number> = {}
  orders.forEach((o) => {
    const city = (o.shipping_address as any)?.city || 'Non renseigné'
    cityCounts[city] = (cityCounts[city] || 0) + 1
  })
  const topCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[var(--color-navy-900)] dark:text-white">
              Studio Analytics & Performances
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              100% Autonome
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-slate-500)] dark:text-slate-400 mt-1">
            Métriques réelles de votre marketplace Bricelo : ventes, commandes, paniers et clients.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
          >
            ← Retour Vue Globale
          </Link>
          <button
            onClick={undefined}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[var(--color-navy-950)] font-black text-xs transition-colors shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Données en Direct</span>
          </button>
        </div>
      </div>

      {/* Cartes KPI Majeures (Chiffres Clés) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chiffre d'Affaires Total */}
        <div className="bg-white dark:bg-[var(--color-navy-950)] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Volume Total Ventes</span>
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[var(--color-navy-900)] dark:text-white">
            {formatPrice(totalRevenue)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Encaissé : {formatPrice(collectedRevenue)}</span>
          </div>
        </div>

        {/* Commandes Totales */}
        <div className="bg-white dark:bg-[var(--color-navy-950)] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Commandes Passées</span>
            <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-orange-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[var(--color-navy-900)] dark:text-white">
            {totalOrders}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>{statusCounts.delivered} livrée(s) avec succès</span>
          </div>
        </div>

        {/* Panier Moyen */}
        <div className="bg-white dark:bg-[var(--color-navy-950)] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Panier Moyen</span>
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[var(--color-navy-900)] dark:text-white">
            {formatPrice(averageBasket)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Moyenne par commande client</span>
          </div>
        </div>

        {/* Clients & Vendeurs */}
        <div className="bg-white dark:bg-[var(--color-navy-950)] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Communauté</span>
            <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center text-violet-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[var(--color-navy-900)] dark:text-white">
            {users.length}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>{customersCount} clients</span>
            <span>•</span>
            <span className="text-violet-600 font-bold">{vendorsCount} vendeurs ({activeStoresCount} actifs)</span>
          </div>
        </div>
      </div>

      {/* Section Principale : Graphique Hebdomadaire & Répartition des Statuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique à barres : Ventes des 7 derniers jours */}
        <div className="lg:col-span-2 bg-white dark:bg-[var(--color-navy-950)] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <h2 className="text-base font-bold text-[var(--color-navy-900)] dark:text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-amber-500" />
                <span>Évolution des Ventes (7 Derniers Jours)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Montant cumulé et commandes enregistrées par jour</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 self-start sm:self-auto">
              Semaine en cours
            </span>
          </div>

          {/* Visualisation graphique (Bâtons CSS réactifs) */}
          <div className="h-56 w-full flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
            {dailyChart.map((d) => {
              const heightPercent = maxDayRevenue > 0 && d.total > 0
                ? Math.max(Math.round((d.total / maxDayRevenue) * 100), 12)
                : 6
              const hasActivity = d.total > 0 || d.count > 0

              return (
                <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                  {/* Tooltip au survol */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-[var(--color-navy-950)] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap border border-slate-800">
                    <p>{d.total > 0 ? formatPrice(d.total) : '0 FCFA'}</p>
                    <p className="text-[10px] text-amber-400 font-normal">{d.count} commande(s)</p>
                  </div>

                  {/* Barre visuelle */}
                  <div className="w-full max-w-[48px] rounded-t-xl bg-slate-100 dark:bg-slate-800/80 overflow-hidden flex items-end transition-all h-full">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        hasActivity
                          ? 'bg-gradient-to-t from-amber-600 to-amber-400 group-hover:brightness-110 shadow-sm'
                          : 'bg-slate-200 dark:bg-slate-700/60'
                      }`}
                    />
                  </div>

                  {/* Étiquette jour */}
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 capitalize">
                    {d.label}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-amber-500" />
              <span>Chiffre d'affaires journalier</span>
            </span>
            <span className="font-bold text-[var(--color-navy-900)] dark:text-white">
              Total 7j : {formatPrice(dailyChart.reduce((s, d) => s + d.total, 0))}
            </span>
          </div>
        </div>

        {/* Répartition par Statut de Commande */}
        <div className="bg-white dark:bg-[var(--color-navy-950)] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--color-navy-900)] dark:text-white flex items-center gap-2 mb-1">
              <Truck className="h-5 w-5 text-sky-500" />
              <span>Statut des Commandes</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">Cycle de vie et préparation des livraisons</p>

            <div className="space-y-4">
              {statusList.map((item) => {
                const percent = totalOrders > 0 ? Math.round((item.count / totalOrders) * 100) : 0
                return (
                  <div key={item.status} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                      <span className="font-black text-slate-900 dark:text-white">
                        {item.count} ({percent}%)
                      </span>
                    </div>
                    <div className={`h-2.5 w-full rounded-full ${item.barBg} overflow-hidden`}>
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Total commandes</span>
            <span className="text-xs font-black text-amber-600 dark:text-amber-400">{totalOrders} commande(s)</span>
          </div>
        </div>
      </div>

      {/* Deuxième Section : Modes de paiement & Villes de livraison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Modes de paiement */}
        <div className="bg-white dark:bg-[var(--color-navy-950)] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <h2 className="text-base font-bold text-[var(--color-navy-900)] dark:text-white flex items-center gap-2 mb-1">
            <Smartphone className="h-5 w-5 text-orange-500" />
            <span>Moyens de Paiement Utilisés</span>
          </h2>
          <p className="text-xs text-slate-400 mb-5">Répartition des transactions mobiles et numériques</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200/50 dark:border-orange-800/40">
              <span className="text-xs font-bold text-orange-700 dark:text-orange-400">Orange Money</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {paymentMethodCounts.orange_money.count}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {formatPrice(paymentMethodCounts.orange_money.total)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/40">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">MTN MoMo</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {paymentMethodCounts.mtn_momo.count}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {formatPrice(paymentMethodCounts.mtn_momo.total)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/40">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">CinetPay / Cartes</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {paymentMethodCounts.cinetpay.count}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {formatPrice(paymentMethodCounts.cinetpay.total)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Total Transactions</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {payments.length}
              </p>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">
                {successfulPayments.length} validée(s)
              </p>
            </div>
          </div>
        </div>

        {/* Villes de livraison */}
        <div className="bg-white dark:bg-[var(--color-navy-950)] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <h2 className="text-base font-bold text-[var(--color-navy-900)] dark:text-white flex items-center gap-2 mb-1">
            <Store className="h-5 w-5 text-violet-500" />
            <span>Répartition Géographique des Clients</span>
          </h2>
          <p className="text-xs text-slate-400 mb-5">Destinations des commandes passées sur BRICELO</p>

          <div className="space-y-3">
            {topCities.length > 0 ? (
              topCities.map(([city, count]) => {
                const percent = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0
                return (
                  <div key={city} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 flex items-center justify-center font-bold text-xs">
                        📍
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">{city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-black text-[var(--color-navy-900)] dark:text-white">{count} commande(s)</span>
                      <span className="text-slate-400">({percent}%)</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Aucune adresse de livraison enregistrée pour l'instant.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Troisième Section : Top Produits les Plus Vendus */}
      <div className="bg-white dark:bg-[var(--color-navy-950)] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-[var(--color-navy-900)] dark:text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-amber-500" />
              <span>Top Produits les Plus Demandés</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Articles ayant généré le plus de commandes et d'unités vendues</p>
          </div>
          <Link
            href="/admin/produits"
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Gérer le catalogue</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {topProducts.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {topProducts.map((p, idx) => (
              <div key={p.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="font-black text-sm text-slate-300 dark:text-slate-600 w-5 text-center">
                    #{idx + 1}
                  </span>
                  <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative shrink-0 border border-slate-200 dark:border-slate-700">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--color-navy-900)] dark:text-white truncate">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Prix unitaire : {formatPrice(p.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 text-right">
                  <div>
                    <p className="text-xs font-black text-amber-600 dark:text-amber-400">
                      {p.unitsSold} vendus
                    </p>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      {formatPrice(p.totalGenerated)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            Les statistiques de vos top produits apparaîtront automatiquement dès les premières commandes clients.
          </div>
        )}
      </div>

      {/* Quatrième Section : Dernières Commandes Récentes en Temps Réel */}
      <div className="bg-white dark:bg-[var(--color-navy-950)] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--color-navy-900)] dark:text-white">
              Historique des Dernières Commandes
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Dernières commandes enregistrées sur la plateforme</p>
          </div>
          <Link
            href="/admin/commandes"
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Voir toutes les commandes</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Commande</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Montant</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                      {(o.user as any)?.full_name || (o.user as any)?.email || 'Client'}
                    </td>
                    <td className="py-3 px-4 font-black text-[var(--color-navy-900)] dark:text-white">
                      {formatPrice(o.total)}
                    </td>
                    <td className="py-3 px-4">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {o.created_at ? formatDate(o.created_at) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            Aucune commande pour le moment.
          </div>
        )}
      </div>
    </div>
  )
}
