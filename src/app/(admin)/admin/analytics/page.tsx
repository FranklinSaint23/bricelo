import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import {
  TrendingUp, ShoppingBag, Users, CreditCard, Package, Store,
  BarChart3, Smartphone, Laptop, Globe, ArrowUpRight, CheckCircle2,
  Share2, Search, ArrowRight, Eye, ShoppingCart, DollarSign,
  MapPin, Activity, ChevronRight
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { AnalyticsHeaderActions } from '@/components/admin/analytics-header-actions'

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) redirect('/login')

  const supabase = await createClient()

  // 1. Récupération des données Supabase réelles
  let ordersData: any[] = []
  let paymentsData: any[] = []
  let usersData: any[] = []
  let storesData: any[] = []
  let productsData: any[] = []
  let orderItemsData: any[] = []
  let analyticsRecord: any = null

  try {
    const [
      ordersRes,
      paymentsRes,
      usersRes,
      storesRes,
      productsRes,
      orderItemsRes,
      analyticsRes,
    ] = await Promise.all([
      supabase
        .from('orders')
        .select('id, total, status, created_at, shipping_address, user:users(full_name, email)')
        .order('created_at', { ascending: false }),
      supabase
        .from('payments')
        .select('id, amount, status, provider, created_at, metadata')
        .order('created_at', { ascending: false }),
      supabase.from('users').select('id, role, created_at'),
      supabase.from('stores').select('id, name, is_active'),
      supabase.from('products').select('id, name, slug, price, images, stock, is_active').eq('is_active', true),
      supabase.from('order_items').select('id, order_id, product_id, quantity, unit_price, total_price, snapshot'),
      supabase.from('system_settings').select('value').eq('key', 'bricelo_analytics_store').maybeSingle(),
    ])

    ordersData = ordersRes?.data ?? []
    paymentsData = paymentsRes?.data ?? []
    usersData = usersRes?.data ?? []
    storesData = storesRes?.data ?? []
    productsData = productsRes?.data ?? []
    orderItemsData = orderItemsRes?.data ?? []
    analyticsRecord = analyticsRes?.data ?? null
  } catch (err) {
    console.error('Erreur chargement analytics:', err)
  }

  const orders = ordersData ?? []
  const payments = paymentsData ?? []
  const users = usersData ?? []
  const stores = storesData ?? []
  const products = productsData ?? []
  const orderItems = orderItemsData ?? []
  const rawAnalytics = (analyticsRecord?.value as any) || {}

  // 2. Calcul du temps réel (Live Visitors réels)
  const now = Date.now()
  const cutoff = now - 5 * 60 * 1000 // 5 minutes
  const liveSessionsMap = rawAnalytics.live_sessions || {}
  const activeNow = Object.values(liveSessionsMap).filter((ts: any) => Number(ts) >= cutoff).length

  // 3. Calculs financiers & volume e-commerce réels
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
  const averageBasket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
  const successfulPayments = payments.filter((p) => p.status === 'success')
  const collectedRevenue = successfulPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  // 4. Sources d'Acquisition réelles
  const storedChannels = rawAnalytics.channels || {}
  const channels = [
    { name: 'Accès Direct', count: Number(storedChannels.direct) || 0, desc: 'Trafic direct (bricelo.com)' },
    { name: 'WhatsApp', count: Number(storedChannels.whatsapp) || 0, desc: 'Liens partagés sur WhatsApp' },
    { name: 'Recherche Google', count: Number(storedChannels.google) || 0, desc: 'Recherches naturelles Google' },
    { name: 'Facebook', count: Number(storedChannels.facebook) || 0, desc: 'Publications et publicités Meta' },
    { name: 'Instagram & TikTok', count: (Number(storedChannels.instagram) || 0) + (Number(storedChannels.tiktok) || 0), desc: 'Réseaux sociaux vidéo & photo' },
  ]
  const totalTrafficVisits = channels.reduce((sum, c) => sum + c.count, 0)
  const todayVisitors = Number(rawAnalytics.visitors?.today) || 0
  const totalRecordedVisitors = Number(rawAnalytics.visitors?.total) || totalTrafficVisits

  // 5. Appareils réels
  const storedDevices = rawAnalytics.devices || {}
  const androidCount = Number(storedDevices.android) || 0
  const iosCount = Number(storedDevices.ios) || 0
  const desktopCount = Number(storedDevices.desktop) || 0
  const tabletCount = Number(storedDevices.tablet) || 0
  const totalDevices = androidCount + iosCount + desktopCount + tabletCount

  const deviceList = [
    { label: 'Mobile Android', count: androidCount, percent: totalDevices > 0 ? Math.round((androidCount / totalDevices) * 100) : 0, icon: Smartphone },
    { label: 'Mobile iPhone (iOS)', count: iosCount, percent: totalDevices > 0 ? Math.round((iosCount / totalDevices) * 100) : 0, icon: Smartphone },
    { label: 'Ordinateurs', count: desktopCount, percent: totalDevices > 0 ? Math.round((desktopCount / totalDevices) * 100) : 0, icon: Laptop },
  ]

  // 6. Entonnoir de Vente (Conversion Funnel réel)
  const storedFunnel = rawAnalytics.funnel || {}
  const funnelVisitors = Math.max(totalRecordedVisitors, totalTrafficVisits)
  const funnelBase = Math.max(funnelVisitors, 1)
  const funnelProductViews = Number(storedFunnel.product_views) || 0
  const funnelCartAdds = Number(storedFunnel.cart_adds) || 0
  const funnelCheckoutStarts = Number(storedFunnel.checkout_starts) || 0
  const funnelOrdersCompleted = totalOrders

  const funnelSteps = [
    { step: '1', label: 'Visiteurs Uniques', count: funnelVisitors, percent: funnelVisitors > 0 ? 100 : 0 },
    { step: '2', label: 'Fiches Produits vues', count: funnelProductViews, percent: funnelVisitors > 0 ? Math.min(100, Math.round((funnelProductViews / funnelBase) * 100)) : 0 },
    { step: '3', label: 'Ajouts au Panier', count: funnelCartAdds, percent: funnelVisitors > 0 ? Math.min(100, Math.round((funnelCartAdds / funnelBase) * 100)) : 0 },
    { step: '4', label: 'Initié commande', count: funnelCheckoutStarts, percent: funnelVisitors > 0 ? Math.min(100, Math.round((funnelCheckoutStarts / funnelBase) * 100)) : 0 },
    { step: '5', label: 'Commandes Finalisées', count: funnelOrdersCompleted, percent: funnelVisitors > 0 ? Math.min(100, Math.round((funnelOrdersCompleted / funnelBase) * 100)) : 0 },
  ]

  // 7. Graphique des 7 derniers jours réels
  const daysMap = new Map<string, { label: string; dateStr: string; count: number; total: number }>()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
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
  const weeklyTotalRevenue = dailyChart.reduce((s, d) => s + d.total, 0)
  const weeklyTotalOrders = dailyChart.reduce((s, d) => s + d.count, 0)

  // 8. Répartition par Villes réelles au Cameroun
  const cityCounts: Record<string, number> = {}
  const storedCities = rawAnalytics.cities || {}
  Object.entries(storedCities).forEach(([cityName, count]) => {
    if (cityName && Number(count) > 0) {
      cityCounts[cityName] = (cityCounts[cityName] || 0) + Number(count)
    }
  })
  orders.forEach((o) => {
    const c = (o.shipping_address as any)?.city
    if (c) cityCounts[c] = (cityCounts[c] || 0) + 1
  })
  const totalCityReports = Object.values(cityCounts).reduce((a, b) => a + b, 0)

  // 9. Top Produits vendus réels
  const productSalesMap = new Map<string, { id: string; name: string; slug: string; image: string; price: number; unitsSold: number; totalGenerated: number }>()
  orderItems.forEach((item) => {
    const pId = item.product_id
    if (!pId) return
    const snapshot = item.snapshot as any
    const name = snapshot?.name || 'Produit'
    const image = snapshot?.images?.[0] || '/placeholder.png'
    const price = Number(item.unit_price) || 0
    const qty = Number(item.quantity) || 1
    const total = Number(item.total_price) || price * qty

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

  const topProducts = Array.from(productSalesMap.values()).slice(0, 5)

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ── EN-TÊTE ÉPURÉ & PROFESSIONNEL ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/admin" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              Administration
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Analytique</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Analytique & Performances
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeNow} en direct</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Métriques d'audience et de ventes 100% réelles issues de votre base de données BRICELO.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <AnalyticsHeaderActions />
        </div>
      </div>

      {/* ── KPI CARDS (HAUTE DENSITÉ & MINIMALISTES) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chiffre d'Affaires */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Chiffre d'Affaires
            </span>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 tracking-tight">
            {formatPrice(totalRevenue)}
          </p>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>{formatPrice(collectedRevenue)} encaissé</span>
          </div>
        </div>

        {/* Commandes Totales */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Commandes Totales
            </span>
            <ShoppingBag className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 tracking-tight">
            {totalOrders}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Panier moyen : <strong className="text-slate-800 dark:text-slate-200 font-semibold">{formatPrice(averageBasket)}</strong>
          </p>
        </div>

        {/* Taux de Conversion */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Taux de Conversion
            </span>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 tracking-tight">
            {totalTrafficVisits > 0 && totalOrders > 0
              ? `${((totalOrders / totalTrafficVisits) * 100).toFixed(1)} %`
              : totalOrders > 0
              ? '100 %'
              : '0.0 %'}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Visites converties en achats réels
          </p>
        </div>

        {/* Visiteurs Détectés */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Visites Aujourd'hui
            </span>
            <Eye className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 tracking-tight">
            {todayVisitors}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {totalRecordedVisitors} visiteur(s) unique(s) cumulé(s)
          </p>
        </div>
      </div>

      {/* ── SECTION PRINCIPALE : GRAPHIQUE 7 JOURS & ACQUISITION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graphique hebdomadaire (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-amber-500" />
                <span>Ventes Quotidiennes (7 Derniers Jours)</span>
              </h2>
              <span className="text-xs font-medium text-slate-500">Semaine en cours</span>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Total hebdomadaire : <strong className="text-slate-700 dark:text-slate-300">{formatPrice(weeklyTotalRevenue)}</strong> ({weeklyTotalOrders} commande{weeklyTotalOrders > 1 ? 's' : ''})
            </p>

            <div className="h-52 w-full flex items-end justify-between gap-2 sm:gap-3 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
              {dailyChart.map((d) => {
                const heightPct = maxDayRevenue > 0 && d.total > 0
                  ? Math.max(Math.round((d.total / maxDayRevenue) * 100), 10)
                  : 4

                return (
                  <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-md whitespace-nowrap border border-slate-800">
                      <p>{d.total > 0 ? formatPrice(d.total) : '0 FCFA'}</p>
                      <p className="text-[10px] text-amber-400 font-normal">{d.count} commande(s)</p>
                    </div>

                    <div className="w-full max-w-[42px] rounded-t-md bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-end h-full">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          d.total > 0
                            ? 'bg-amber-500 dark:bg-amber-400'
                            : 'bg-slate-200 dark:bg-slate-700/60'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 capitalize">
                      {d.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
            <span>Montant en FCFA par jour civil</span>
            <span>Mise à jour automatique</span>
          </div>
        </div>

        {/* Canaux d'Acquisition (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="h-4 w-4 text-amber-500" />
                <span>Origine du Trafic</span>
              </h2>
              <span className="text-xs font-medium text-slate-500">{totalTrafficVisits} visite(s)</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Canaux détectés lors de l'accès à BRICELO
            </p>

            <div className="space-y-3">
              {channels.map((ch) => {
                const pct = totalTrafficVisits > 0 ? Math.round((ch.count / totalTrafficVisits) * 100) : 0
                return (
                  <div key={ch.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {ch.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">{ch.count}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[32px] text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          ch.count > 0 ? 'bg-amber-500' : 'bg-transparent'
                        }`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Trafic local / dev exclu du comptage.
          </div>
        </div>
      </div>

      {/* ── SECTION SECONDAIRE : FUNNEL & APPAREILS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Entonnoir (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span>Entonnoir de Conversion E-commerce</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Parcours d'achat</span>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Progression des utilisateurs de la visite initiale jusqu'à la commande finalisée
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {funnelSteps.map((f) => (
              <div
                key={f.step}
                className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Étape {f.step}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {f.percent}%
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    {f.label}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-base font-bold text-slate-900 dark:text-white">{f.count}</p>
                  <div className="h-1 w-full rounded-full bg-slate-200 dark:bg-slate-700 mt-1.5 overflow-hidden">
                    <div
                      style={{ width: `${f.percent}%` }}
                      className="h-full rounded-full bg-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Appareils (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-indigo-500" />
                <span>Appareils Utilisés</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">{totalDevices} session(s)</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Répartition par type d'équipement
            </p>

            <div className="space-y-3.5">
              {deviceList.map((dev) => {
                const Icon = dev.icon
                return (
                  <div key={dev.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                        <Icon className="h-3.5 w-3.5 text-slate-400" />
                        <span>{dev.label}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">({dev.count})</span>
                        <span className="font-semibold text-slate-900 dark:text-white min-w-[30px] text-right">
                          {dev.percent}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${dev.percent}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          dev.count > 0 ? 'bg-indigo-500' : 'bg-transparent'
                        }`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            {totalDevices === 0
              ? 'En attente de sessions enregistrées.'
              : 'Données basées sur le user-agent des visiteurs.'}
          </div>
        </div>
      </div>

      {/* ── SECTION TERTIAIRE : VILLES & TOP PRODUITS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Villes de commande (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-rose-500" />
              <span>Villes & Localisation (Cameroun)</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">{totalCityReports} adresse(s)</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Villes réelles issues des adresses de commande
          </p>

          <div className="space-y-2.5">
            {Object.keys(cityCounts).length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                Aucune adresse de commande enregistrée pour le moment.
              </div>
            ) : (
              Object.entries(cityCounts).map(([cityName, count]) => {
                const pct = Math.round((count / Math.max(totalCityReports, 1)) * 100)
                return (
                  <div
                    key={cityName}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {cityName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">{count} commande(s)</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 min-w-[32px] text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Top Produits Vendus (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-500" />
              <span>Articles les Plus Vendus</span>
            </h2>
            <Link
              href="/admin/produits"
              className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Catalogue</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Produits ayant généré des ventes réelles dans les commandes
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {topProducts.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                Aucun article commandé pour le moment.
              </div>
            ) : (
              topProducts.map((p, idx) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-semibold text-slate-400 w-4 text-center">
                      #{idx + 1}
                    </span>
                    <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden relative shrink-0 border border-slate-200 dark:border-slate-700">
                      <Image src={p.image} alt={p.name} fill className="object-cover" unoptimized />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {p.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {p.unitsSold} vente{p.unitsSold > 1 ? 's' : ''}
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      {formatPrice(p.totalGenerated)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

