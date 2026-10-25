import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import {
  TrendingUp, ShoppingBag, Users, CreditCard, Package, Store,
  BarChart3, Smartphone, Laptop, Globe, ArrowUpRight, CheckCircle2,
  Share2, Search, ArrowRight, Eye, RefreshCw, ShoppingCart, DollarSign,
  Compass, MapPin, Radio, Activity
} from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import { OrderStatusBadge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) redirect('/login')

  const supabase = await createClient()

  // 1. Récupération des données Supabase avec tolérance aux pannes
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
    { name: 'WhatsApp', icon: '📱', color: 'bg-emerald-500', barBg: 'bg-emerald-100 dark:bg-emerald-950/60', count: Number(storedChannels.whatsapp) || 0, desc: 'Statuts & partages dans les groupes WhatsApp' },
    { name: 'Facebook', icon: '📘', color: 'bg-blue-600', barBg: 'bg-blue-100 dark:bg-blue-950/60', count: Number(storedChannels.facebook) || 0, desc: 'Publications et publicités Meta' },
    { name: 'Accès Direct', icon: '🌐', color: 'bg-amber-500', barBg: 'bg-amber-100 dark:bg-amber-950/60', count: Number(storedChannels.direct) || 0, desc: 'Visiteurs tapant directement bricelo.com' },
    { name: 'Recherche Google', icon: '🔍', color: 'bg-sky-500', barBg: 'bg-sky-100 dark:bg-sky-950/60', count: Number(storedChannels.google) || 0, desc: 'Recherches naturelles sur Google' },
    { name: 'Instagram & TikTok', icon: '📷', color: 'bg-purple-600', barBg: 'bg-purple-100 dark:bg-purple-950/60', count: (Number(storedChannels.instagram) || 0) + (Number(storedChannels.tiktok) || 0), desc: 'Réseaux visuels et vidéos' },
  ]
  const totalTrafficVisits = channels.reduce((sum, c) => sum + c.count, 0)
  const todayVisitors = Number(rawAnalytics.visitors?.today) || 0

  // 5. Appareils & Systèmes d'exploitation réels
  const storedDevices = rawAnalytics.devices || {}
  const androidCount = Number(storedDevices.android) || 0
  const iosCount = Number(storedDevices.ios) || 0
  const desktopCount = Number(storedDevices.desktop) || 0
  const tabletCount = Number(storedDevices.tablet) || 0
  const totalDevices = androidCount + iosCount + desktopCount + tabletCount

  const deviceList = [
    { label: 'Mobile Android (Tecno, Samsung, Infinix...)', percent: totalDevices > 0 ? Math.round((androidCount / totalDevices) * 100) : 0, count: androidCount, color: 'bg-emerald-500', icon: Smartphone },
    { label: 'Mobile iPhone (Apple iOS)', percent: totalDevices > 0 ? Math.round((iosCount / totalDevices) * 100) : 0, count: iosCount, color: 'bg-indigo-500', icon: Smartphone },
    { label: 'Ordinateurs (Windows / Mac)', percent: totalDevices > 0 ? Math.round((desktopCount / totalDevices) * 100) : 0, count: desktopCount, color: 'bg-slate-500', icon: Laptop },
  ]

  // 6. Entonnoir de Vente réel (Conversion Funnel)
  const storedFunnel = rawAnalytics.funnel || {}
  const funnelVisitors = Math.max(Number(rawAnalytics.visitors?.total) || 0, totalTrafficVisits)
  const funnelBase = Math.max(funnelVisitors, 1)
  const funnelProductViews = Number(storedFunnel.product_views) || 0
  const funnelCartAdds = Number(storedFunnel.cart_adds) || 0
  const funnelCheckoutStarts = Number(storedFunnel.checkout_starts) || 0
  const funnelOrdersCompleted = totalOrders

  const funnelSteps = [
    { step: 1, label: 'Visiteurs sur BRICELO', count: funnelVisitors, percent: funnelVisitors > 0 ? 100 : 0, color: 'bg-blue-500' },
    { step: 2, label: 'Consultation Fiches Produits', count: funnelProductViews, percent: funnelVisitors > 0 ? Math.min(100, Math.round((funnelProductViews / funnelBase) * 100)) : 0, color: 'bg-sky-500' },
    { step: 3, label: 'Ajouts au Panier', count: funnelCartAdds, percent: funnelVisitors > 0 ? Math.min(100, Math.round((funnelCartAdds / funnelBase) * 100)) : 0, color: 'bg-amber-500' },
    { step: 4, label: 'Débuts de Commande', count: funnelCheckoutStarts, percent: funnelVisitors > 0 ? Math.min(100, Math.round((funnelCheckoutStarts / funnelBase) * 100)) : 0, color: 'bg-orange-500' },
    { step: 5, label: 'Paiements Finalisés & Validés', count: funnelOrdersCompleted, percent: funnelVisitors > 0 ? Math.min(100, Math.round((funnelOrdersCompleted / funnelBase) * 100)) : 0, color: 'bg-emerald-500' },
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* ── BANNIÈRE TEMPS RÉEL (Live Pulse) ── */}
      <div className="bg-gradient-to-r from-[var(--color-navy-950)] via-[var(--color-navy-900)] to-slate-900 rounded-3xl p-6 text-white border border-white/10 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="relative flex items-center justify-center">
            <span className="absolute h-12 w-12 rounded-full bg-emerald-400/20 animate-ping" />
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Radio className="h-6 w-6 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-3xl font-black text-white tracking-tight">{activeNow}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                En ligne en ce moment
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Visiteurs naviguant actuellement sur les pages et fiches produits de BRICELO.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
          <div>
            <p className="text-xs text-slate-400 font-medium">Visiteurs Détectés (Aujourd'hui)</p>
            <p className="text-xl font-black text-white mt-0.5">
              {todayVisitors} personne{todayVisitors > 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-colors shrink-0"
          >
            ← Vue Globale
          </Link>
        </div>
      </div>

      {/* ── CHIFFRES CLÉS FINANCIERS & E-COMMERCE ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[var(--color-navy-950)] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Chiffre d'Affaires</span>
          <p className="text-2xl sm:text-3xl font-black text-[var(--color-navy-900)] dark:text-white mt-1">
            {formatPrice(totalRevenue)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Encaissé : {formatPrice(collectedRevenue)}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[var(--color-navy-950)] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Commandes Totales</span>
          <p className="text-2xl sm:text-3xl font-black text-[var(--color-navy-900)] dark:text-white mt-1">
            {totalOrders}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Panier moyen : <strong className="text-slate-800 dark:text-white">{formatPrice(averageBasket)}</strong>
          </p>
        </div>

        <div className="bg-white dark:bg-[var(--color-navy-950)] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Taux de Conversion Global</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {totalTrafficVisits > 0 && totalOrders > 0
              ? `${((totalOrders / totalTrafficVisits) * 100).toFixed(1)} %`
              : totalOrders > 0
              ? '100 %'
              : '0 %'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Visiteurs transformés en acheteurs
          </p>
        </div>

        <div className="bg-white dark:bg-[var(--color-navy-950)] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Comptes Inscrits</span>
          <p className="text-2xl sm:text-3xl font-black text-[var(--color-navy-900)] dark:text-white mt-1">
            {users.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {users.filter((u) => u.role === 'customer').length} clients • {stores.filter((s) => s.is_active).length} boutiques
          </p>
        </div>
      </div>

      {/* ── CANAUX D'ACQUISITION (D'où viennent vos clients ?) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[var(--color-navy-950)] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-[var(--color-navy-900)] dark:text-white flex items-center gap-2">
              <Share2 className="h-5 w-5 text-amber-500" />
              <span>Canaux d'Acquisition (D'où viennent vos visiteurs ?)</span>
            </h2>
            <span className="text-xs font-bold text-slate-400">Total : {totalTrafficVisits} visites</span>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Détection automatique des liens partagés sur WhatsApp, Facebook, Instagram et des recherches Google.
          </p>

          <div className="space-y-4">
            {channels.map((ch) => {
              const pct = totalTrafficVisits > 0 ? Math.round((ch.count / totalTrafficVisits) * 100) : 0
              return (
                <div key={ch.name} className="space-y-1.5 p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{ch.icon}</span>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{ch.name}</span>
                        <p className="text-[10px] text-slate-400">{ch.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 dark:text-white text-sm">{pct}%</span>
                      <p className="text-[10px] text-slate-400 font-medium">{ch.count} visite(s)</p>
                    </div>
                  </div>
                  <div className={`h-2.5 w-full rounded-full ${ch.barBg} overflow-hidden mt-2`}>
                    <div style={{ width: `${pct}%` }} className={`h-full rounded-full ${ch.color} transition-all duration-700`} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── APPAREILS & SMARTPHONES (Mobile Android vs iPhone vs PC) ── */}
        <div className="bg-white dark:bg-[var(--color-navy-950)] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--color-navy-900)] dark:text-white flex items-center gap-2 mb-1">
              <Smartphone className="h-5 w-5 text-indigo-500" />
              <span>Appareils Utilisés</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">Répartition par type d'écran et système</p>

            <div className="space-y-5">
              {deviceList.map((dev) => {
                const Icon = dev.icon
                return (
                  <div key={dev.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 text-slate-400" />
                        <span>{dev.label}</span>
                      </span>
                      <span className="font-black text-slate-900 dark:text-white">{dev.percent}%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div style={{ width: `${dev.percent}%` }} className={`h-full rounded-full ${dev.color} transition-all duration-700`} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">ℹ️ Appareils détectés :</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {totalDevices > 0
                ? `${totalDevices} session(s) analysée(s) en direct selon les types d'écrans de vos utilisateurs.`
                : 'En attente des premières visites de clients sur le site.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── ENTONNOIR DE CONVERSION E-COMMERCE (Funnel d'Achat) ── */}
      <div className="bg-white dark:bg-[var(--color-navy-950)] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <h2 className="text-base sm:text-lg font-bold text-[var(--color-navy-900)] dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <span>Entonnoir de Conversion d'Achat (Funnel)</span>
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
            Parcours Client Complet
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-8 max-w-2xl">
          Visualisez précisément où vos visiteurs avancent et où ils abandonnent dans le processus de commande.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {funnelSteps.map((f, i) => (
            <div
              key={f.step}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between relative group hover:border-amber-400/50 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center">
                    {f.step}
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">{f.percent}%</span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">{f.label}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800">
                <p className="text-lg font-black text-[var(--color-navy-900)] dark:text-white">{f.count}</p>
                <p className="text-[10px] text-slate-400">utilisateurs</p>
                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 mt-2 overflow-hidden">
                  <div style={{ width: `${f.percent}%` }} className={`h-full rounded-full ${f.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── VILLES AU CAMEROUN & GRAPHIQUE 7 JOURS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique 7 jours */}
        <div className="lg:col-span-2 bg-white dark:bg-[var(--color-navy-950)] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-[var(--color-navy-900)] dark:text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-amber-500" />
                <span>Commandes & Ventes Journalières (7 Derniers Jours)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Montant cumulé en FCFA par journée</p>
            </div>
            <span className="text-xs font-bold text-slate-500">7 derniers jours</span>
          </div>

          <div className="h-56 w-full flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
            {dailyChart.map((d) => {
              const heightPercent = maxDayRevenue > 0 && d.total > 0
                ? Math.max(Math.round((d.total / maxDayRevenue) * 100), 12)
                : 6

              return (
                <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-[var(--color-navy-950)] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap border border-slate-800">
                    <p>{d.total > 0 ? formatPrice(d.total) : '0 FCFA'}</p>
                    <p className="text-[10px] text-amber-400 font-normal">{d.count} commande(s)</p>
                  </div>
                  <div className="w-full max-w-[48px] rounded-t-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-end h-full">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        d.total > 0
                          ? 'bg-gradient-to-t from-amber-600 to-amber-400 group-hover:brightness-110'
                          : 'bg-slate-200 dark:bg-slate-700/60'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 capitalize">
                    {d.label}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Barres proportionnelles au chiffre d'affaires</span>
            <span className="font-bold text-[var(--color-navy-900)] dark:text-white">
              Semaine : {formatPrice(dailyChart.reduce((s, d) => s + d.total, 0))}
            </span>
          </div>
        </div>

        {/* Villes au Cameroun */}
        <div className="bg-white dark:bg-[var(--color-navy-950)] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--color-navy-900)] dark:text-white flex items-center gap-2 mb-1">
              <MapPin className="h-5 w-5 text-rose-500" />
              <span>Localisation des Visiteurs & Commandes</span>
            </h2>
            <p className="text-xs text-slate-400 mb-5">Villes principales au Cameroun</p>

            <div className="space-y-3">
              {Object.keys(cityCounts).length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Aucune ville enregistrée pour le moment.
                </div>
              ) : (
                Object.entries(cityCounts).map(([cityName, count]) => {
                  const pct = Math.round((count / Math.max(totalCityReports, 1)) * 100)
                  return (
                    <div key={cityName} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">📍</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{cityName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-black text-slate-900 dark:text-white">{pct}%</span>
                        <span className="text-slate-400 font-medium">({count})</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <p className="mt-4 text-[11px] text-slate-400 text-center">
            🇨🇲 Localisations réelles issues des adresses de commande.
          </p>
        </div>
      </div>

      {/* ── TOP PRODUITS LES PLUS DEMANDÉS ── */}
      <div className="bg-white dark:bg-[var(--color-navy-950)] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-[var(--color-navy-900)] dark:text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-amber-500" />
              <span>Articles & Produits les Plus Populaires</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Produits générant le plus de visites et de commandes</p>
          </div>
          <Link
            href="/admin/produits"
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Catalogue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {topProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Aucun article commandé pour le moment.
            </div>
          ) : (
            topProducts.map((p, idx) => (
              <div key={p.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="font-black text-sm text-slate-300 dark:text-slate-600 w-5 text-center">
                    #{idx + 1}
                  </span>
                  <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative shrink-0 border border-slate-200 dark:border-slate-700">
                    <Image src={p.image} alt={p.name} fill className="object-cover" unoptimized />
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

                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-amber-600 dark:text-amber-400">
                    {p.unitsSold} commande{p.unitsSold > 1 ? 's' : ''}
                  </p>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    {formatPrice(p.totalGenerated)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
