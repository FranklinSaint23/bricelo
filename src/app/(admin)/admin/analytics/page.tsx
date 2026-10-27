import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import {
  TrendingUp, ShoppingBag, Users, Package,
  BarChart3, Smartphone, Laptop, CheckCircle2,
  Share2, ArrowRight, Eye, DollarSign,
  MapPin, Activity, ChevronRight, Clock, Compass, Target,
  UserCheck, UserPlus, Layers, Calendar
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { AnalyticsHeaderActions } from '@/components/admin/analytics-header-actions'
import { AnalyticsPeriodSelector } from '@/components/admin/analytics-period-selector'
import { PERIODS, type PeriodType, getPeriodConfig } from '@/lib/analytics-constants'
import { AnalyticsMapClient } from '@/components/admin/analytics-map-client'

export const dynamic = 'force-dynamic'

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 s'
  if (seconds < 60) return `${seconds} s`
  const mins = Math.floor(seconds / 60)
  const remSecs = seconds % 60
  if (mins < 60) {
    return remSecs > 0 ? `${mins}m ${remSecs}s` : `${mins} min`
  }
  const hours = Math.floor(mins / 60)
  const remMins = mins % 60
  return `${hours}h ${remMins}m`
}

interface PageProps {
  searchParams?: Promise<{ period?: string }>
}

export default async function AdminAnalyticsPage(props: PageProps) {
  try {
    const searchParams = props?.searchParams ? await props.searchParams : {}
    const period: PeriodType = (searchParams?.period as PeriodType) || 'all'

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
  const activeNow = Object.values(liveSessionsMap).filter((item: any) => {
    const ts = typeof item === 'number' ? item : (item?.timestamp || 0)
    return Number(ts) >= cutoff
  }).length

  // 3. Calcul de la fenêtre temporelle selon la période sélectionnée
  const todayDateObj = new Date()
  const todayStr = todayDateObj.toISOString().split('T')[0]

  const yesterdayDateObj = new Date(now - 24 * 60 * 60 * 1000)
  const yesterdayStr = yesterdayDateObj.toISOString().split('T')[0]

  let periodStart = 0
  let periodEnd = now

  if (period === 'today') {
    const startOfToday = new Date(todayDateObj.getFullYear(), todayDateObj.getMonth(), todayDateObj.getDate(), 0, 0, 0, 0)
    periodStart = startOfToday.getTime()
  } else if (period === 'yesterday') {
    const startOfYesterday = new Date(yesterdayDateObj.getFullYear(), yesterdayDateObj.getMonth(), yesterdayDateObj.getDate(), 0, 0, 0, 0)
    const endOfYesterday = new Date(yesterdayDateObj.getFullYear(), yesterdayDateObj.getMonth(), yesterdayDateObj.getDate(), 23, 59, 59, 999)
    periodStart = startOfYesterday.getTime()
    periodEnd = endOfYesterday.getTime()
  } else if (period === 'week') {
    periodStart = now - 7 * 24 * 60 * 60 * 1000
  } else if (period === 'month') {
    periodStart = now - 30 * 24 * 60 * 60 * 1000
  } else if (period === 'year') {
    const startOfYear = new Date(todayDateObj.getFullYear(), 0, 1, 0, 0, 0, 0)
    periodStart = startOfYear.getTime()
  }

  const currentPeriodConfig = getPeriodConfig(period)
  const periodLabel = currentPeriodConfig.label

  // 4. Filtrage des Commandes et Paiements selon la période
  const filteredOrders = orders.filter((o) => {
    if (!o.created_at) return false
    const t = new Date(o.created_at).getTime()
    return t >= periodStart && t <= periodEnd
  })

  const filteredPayments = payments.filter((p) => {
    if (!p.created_at) return false
    const t = new Date(p.created_at).getTime()
    return t >= periodStart && t <= periodEnd
  })

  const totalOrders = filteredOrders.length
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
  const averageBasket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
  const successfulPayments = filteredPayments.filter((p) => p.status === 'success')
  const collectedRevenue = successfulPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  // 5. Agrégation du trafic, engagement & audience selon la période
  const rawEngagement = rawAnalytics.engagement || {}
  const rawSessions = rawAnalytics.sessions || {}
  const rawAudience = rawAnalytics.audience || {}
  const rawDailyHistory = rawAnalytics.daily_history || {}

  let totalPageViews = 0
  let totalSessions = 0
  let totalEngagementSeconds = 0
  let newVisitors = 0
  let returningVisitors = 0
  let storedTopPages: Record<string, any> = {}
  let storedChannels: Record<string, any> = {}
  let storedDevices: Record<string, any> = {}
  let storedBrowsers: Record<string, any> = {}
  let storedCities: Record<string, any> = {}

  if (period === 'all') {
    totalPageViews = Number(rawAnalytics.visitors?.total) || 0
    totalSessions = Math.max(Number(rawSessions.total) || (totalPageViews > 0 ? Math.ceil(totalPageViews / 2) : 0), 0)
    totalEngagementSeconds = Number(rawEngagement.total_seconds) || 0
    newVisitors = Number(rawAudience.new_visitors) || 0
    returningVisitors = Number(rawAudience.returning_visitors) || 0
    storedTopPages = rawAnalytics.top_pages || {}
    storedChannels = rawAnalytics.channels || {}
    storedDevices = rawAnalytics.devices || {}
    storedBrowsers = rawAnalytics.browsers || {}
    storedCities = rawAnalytics.cities || {}
  } else if (period === 'today') {
    const dayRec = rawDailyHistory[todayStr]
    totalPageViews = dayRec?.views ?? (Number(rawAnalytics.visitors?.today) || 0)
    totalSessions = dayRec?.sessions ?? (Number(rawSessions.today) || totalPageViews)
    totalEngagementSeconds = dayRec?.total_seconds ?? (dayRec ? 0 : Number(rawEngagement.total_seconds) || 0)
    newVisitors = dayRec?.new_visitors ?? 0
    returningVisitors = dayRec?.returning_visitors ?? 0
    storedTopPages = dayRec?.top_pages ?? rawAnalytics.top_pages ?? {}
    storedChannels = dayRec?.channels ?? (totalPageViews > 0 ? (rawAnalytics.channels ?? {}) : {})
    storedDevices = dayRec?.devices ?? (totalPageViews > 0 ? (rawAnalytics.devices ?? {}) : {})
    storedBrowsers = dayRec?.browsers ?? (totalPageViews > 0 ? (rawAnalytics.browsers ?? {}) : {})
    storedCities = dayRec?.cities ?? {}
  } else if (period === 'yesterday') {
    const dayRec = rawDailyHistory[yesterdayStr]
    totalPageViews = dayRec?.views ?? 0
    totalSessions = dayRec?.sessions ?? 0
    totalEngagementSeconds = dayRec?.total_seconds ?? 0
    newVisitors = dayRec?.new_visitors ?? 0
    returningVisitors = dayRec?.returning_visitors ?? 0
    storedTopPages = dayRec?.top_pages ?? {}
    storedChannels = dayRec?.channels ?? {}
    storedDevices = dayRec?.devices ?? {}
    storedBrowsers = dayRec?.browsers ?? {}
    storedCities = dayRec?.cities ?? {}
  } else {
    // 'week', 'month', 'year'
    let aggPageViews = 0
    let aggSessions = 0
    let aggSeconds = 0
    let aggNewVisitors = 0
    let aggReturningVisitors = 0
    const aggTopPages: Record<string, { views: number; total_seconds: number }> = {}
    const aggChannels: Record<string, number> = {}
    const aggDevices: Record<string, number> = {}
    const aggBrowsers: Record<string, number> = {}
    const aggCities: Record<string, number> = {}

    Object.entries(rawDailyHistory).forEach(([dateStr, rec]: [string, any]) => {
      if (!rec) return
      const t = new Date(dateStr + 'T12:00:00Z').getTime()
      if (t >= periodStart && t <= periodEnd) {
        aggPageViews += Number(rec.views) || 0
        aggSessions += Number(rec.sessions) || 0
        aggSeconds += Number(rec.total_seconds) || 0
        aggNewVisitors += Number(rec.new_visitors) || 0
        aggReturningVisitors += Number(rec.returning_visitors) || 0

        if (rec.top_pages) {
          Object.entries(rec.top_pages).forEach(([p, val]: [string, any]) => {
            if (!aggTopPages[p]) aggTopPages[p] = { views: 0, total_seconds: 0 }
            aggTopPages[p].views += typeof val === 'number' ? val : (Number(val?.views) || 0)
            aggTopPages[p].total_seconds += typeof val === 'object' ? (Number(val?.total_seconds) || 0) : 0
          })
        }
        if (rec.channels) {
          Object.entries(rec.channels).forEach(([ch, count]: [string, any]) => {
            aggChannels[ch] = (aggChannels[ch] || 0) + (Number(count) || 0)
          })
        }
        if (rec.devices) {
          Object.entries(rec.devices).forEach(([dev, count]: [string, any]) => {
            aggDevices[dev] = (aggDevices[dev] || 0) + (Number(count) || 0)
          })
        }
        if (rec.browsers) {
          Object.entries(rec.browsers).forEach(([br, count]: [string, any]) => {
            aggBrowsers[br] = (aggBrowsers[br] || 0) + (Number(count) || 0)
          })
        }
        if (rec.cities) {
          Object.entries(rec.cities).forEach(([city, count]: [string, any]) => {
            aggCities[city] = (aggCities[city] || 0) + (Number(count) || 0)
          })
        }
      }
    })

    totalPageViews = aggPageViews > 0 ? aggPageViews : (period === 'week' || period === 'month' || period === 'year' ? Number(rawAnalytics.visitors?.total) || 0 : 0)
    totalSessions = aggSessions > 0 ? aggSessions : (totalPageViews > 0 ? Math.ceil(totalPageViews / 2) : 0)
    totalEngagementSeconds = aggSeconds > 0 ? aggSeconds : (aggPageViews > 0 ? 0 : Number(rawEngagement.total_seconds) || 0)
    newVisitors = aggNewVisitors > 0 ? aggNewVisitors : Number(rawAudience.new_visitors) || 0
    returningVisitors = aggReturningVisitors > 0 ? aggReturningVisitors : Number(rawAudience.returning_visitors) || 0
    storedTopPages = Object.keys(aggTopPages).length > 0 ? aggTopPages : (rawAnalytics.top_pages || {})
    storedChannels = Object.keys(aggChannels).length > 0 ? aggChannels : (rawAnalytics.channels || {})
    storedDevices = Object.keys(aggDevices).length > 0 ? aggDevices : (rawAnalytics.devices || {})
    storedBrowsers = Object.keys(aggBrowsers).length > 0 ? aggBrowsers : (rawAnalytics.browsers || {})
    storedCities = Object.keys(aggCities).length > 0 ? aggCities : (rawAnalytics.cities || {})
  }

  // Temps moyen par session & Taux de rebond
  const avgSessionSeconds = totalSessions > 0 ? Math.round(totalEngagementSeconds / totalSessions) : 0
  const engagedSessionsMap = rawEngagement.engaged_sessions || {}
  const engagedSessionsCount = Object.keys(engagedSessionsMap).length
  const engagementRate = totalSessions > 0 ? Math.min(100, Math.round((engagedSessionsCount / totalSessions) * 100)) : 0
  const bounceRate = totalSessions > 0 ? Math.max(0, 100 - engagementRate) : 0
  const pagesPerSession = totalSessions > 0 ? (totalPageViews / totalSessions).toFixed(1) : '1.0'

  // Audience : Nouveaux vs Récurrents
  const totalAudience = newVisitors + returningVisitors
  const newVisitorsPct = totalAudience > 0 ? Math.round((newVisitors / totalAudience) * 100) : (totalPageViews > 0 ? 100 : 0)
  const returningVisitorsPct = totalAudience > 0 ? Math.round((returningVisitors / totalAudience) * 100) : 0

  // 6. Pages les plus visitées (Google Analytics Pages & Screens)
  const pagesList: Array<{ path: string; views: number; totalSeconds: number; avgSeconds: number; pct: number }> = []
  Object.entries(storedTopPages).forEach(([p, val]: [string, any]) => {
    const views = typeof val === 'number' ? val : (Number(val?.views) || 0)
    const totalSecs = typeof val === 'object' ? (Number(val?.total_seconds) || 0) : 0
    const avgSecs = views > 0 ? Math.round(totalSecs / views) : 0
    if (views > 0) {
      pagesList.push({
        path: p,
        views,
        totalSeconds: totalSecs,
        avgSeconds: avgSecs,
        pct: totalPageViews > 0 ? Math.round((views / totalPageViews) * 100) : 0,
      })
    }
  })
  pagesList.sort((a, b) => b.views - a.views)

  // 7. Sources d'Acquisition
  const channels = [
    { name: 'Accès Direct', count: Number(storedChannels.direct) || 0, desc: 'Trafic direct (bricelo.com)' },
    { name: 'WhatsApp', count: Number(storedChannels.whatsapp) || 0, desc: 'Liens partagés sur WhatsApp' },
    { name: 'Recherche Google', count: Number(storedChannels.google) || 0, desc: 'Recherches naturelles Google' },
    { name: 'Facebook', count: Number(storedChannels.facebook) || 0, desc: 'Publications et publicités Meta' },
    { name: 'Instagram & TikTok', count: (Number(storedChannels.instagram) || 0) + (Number(storedChannels.tiktok) || 0), desc: 'Réseaux sociaux photo & vidéo' },
    { name: 'Autre', count: Number(storedChannels.other) || 0, desc: 'Autres sites référents' },
  ]
  const totalTrafficVisits = channels.reduce((sum, c) => sum + c.count, 0)

  // Campagnes UTM (si présentes)
  const storedCampaigns = rawAnalytics.campaigns || {}
  const campaignList = Object.entries(storedCampaigns)
    .map(([camp, count]) => ({ name: camp, count: Number(count) || 0 }))
    .sort((a, b) => b.count - a.count)

  // 8. Appareils & Navigateurs
  const androidCount = Number(storedDevices.android) || 0
  const iosCount = Number(storedDevices.ios) || 0
  const desktopCount = Number(storedDevices.desktop) || 0
  const tabletCount = Number(storedDevices.tablet) || 0
  const totalDevices = androidCount + iosCount + desktopCount + tabletCount

  const deviceList = [
    { label: 'Mobile iPhone (iOS)', count: iosCount, percent: totalDevices > 0 ? Math.round((iosCount / totalDevices) * 100) : 0, icon: Smartphone },
    { label: 'Mobile Android', count: androidCount, percent: totalDevices > 0 ? Math.round((androidCount / totalDevices) * 100) : 0, icon: Smartphone },
    { label: 'Ordinateurs', count: desktopCount, percent: totalDevices > 0 ? Math.round((desktopCount / totalDevices) * 100) : 0, icon: Laptop },
    { label: 'Tablettes', count: tabletCount, percent: totalDevices > 0 ? Math.round((tabletCount / totalDevices) * 100) : 0, icon: Smartphone },
  ]

  const chromeCount = Number(storedBrowsers.chrome) || 0
  const safariCount = Number(storedBrowsers.safari) || 0
  const firefoxCount = Number(storedBrowsers.firefox) || 0
  const edgeCount = Number(storedBrowsers.edge) || 0
  const otherBrowserCount = Number(storedBrowsers.other) || 0
  const totalBrowsers = chromeCount + safariCount + firefoxCount + edgeCount + otherBrowserCount

  const browserList = [
    { name: 'Safari', count: safariCount, pct: totalBrowsers > 0 ? Math.round((safariCount / totalBrowsers) * 100) : 0 },
    { name: 'Google Chrome', count: chromeCount, pct: totalBrowsers > 0 ? Math.round((chromeCount / totalBrowsers) * 100) : 0 },
    { name: 'Firefox', count: firefoxCount, pct: totalBrowsers > 0 ? Math.round((firefoxCount / totalBrowsers) * 100) : 0 },
    { name: 'Microsoft Edge', count: edgeCount, pct: totalBrowsers > 0 ? Math.round((edgeCount / totalBrowsers) * 100) : 0 },
    { name: 'Autre', count: otherBrowserCount, pct: totalBrowsers > 0 ? Math.round((otherBrowserCount / totalBrowsers) * 100) : 0 },
  ].filter(b => b.count > 0 || totalBrowsers === 0)

  // 9. Entonnoir de Vente (Funnel de conversion)
  const storedFunnel = rawAnalytics.funnel || {}
  const funnelVisitors = Math.max(totalPageViews, totalTrafficVisits)
  const funnelBase = Math.max(funnelVisitors, 1)
  const funnelProductViews = Number(storedFunnel.product_views) || 0
  const funnelCartAdds = Number(storedFunnel.cart_adds) || 0
  const funnelCheckoutStarts = Number(storedFunnel.checkout_starts) || 0
  const funnelOrdersCompleted = totalOrders

  const funnelSteps = [
    { step: '1', label: 'Visites', count: funnelVisitors, percent: funnelVisitors > 0 ? 100 : 0 },
    { step: '2', label: 'Vues Produits', count: funnelProductViews, percent: funnelVisitors > 0 ? Math.min(100, Math.round((funnelProductViews / funnelBase) * 100)) : 0 },
    { step: '3', label: 'Panier', count: funnelCartAdds, percent: funnelVisitors > 0 ? Math.min(100, Math.round((funnelCartAdds / funnelBase) * 100)) : 0 },
    { step: '4', label: 'Checkout', count: funnelCheckoutStarts, percent: funnelVisitors > 0 ? Math.min(100, Math.round((funnelCheckoutStarts / funnelBase) * 100)) : 0 },
    { step: '5', label: 'Commandes', count: funnelOrdersCompleted, percent: funnelVisitors > 0 ? Math.min(100, Math.round((funnelOrdersCompleted / funnelBase) * 100)) : 0 },
  ]

  // 10. Graphique dynamique adapté à la période sélectionnée
  let chartTitle = 'Activité des 7 derniers jours'
  let chartSubtitle = 'Chiffre d’affaires et commandes quotidiennes'
  const chartItems: Array<{ label: string; count: number; total: number; id: string }> = []

  if (period === 'today' || period === 'yesterday') {
    const isToday = period === 'today'
    chartTitle = isToday ? "Activité d'Aujourd'hui par tranches horaires" : "Activité d'Hier par tranches horaires"
    chartSubtitle = 'Volume des commandes réparties sur les 24 heures de la journée'

    const slotLabels = ['00h-03h', '03h-06h', '06h-09h', '09h-12h', '12h-15h', '15h-18h', '18h-21h', '21h-24h']
    const slots = slotLabels.map((l, idx) => ({ id: `slot_${idx}`, label: l, count: 0, total: 0 }))

    filteredOrders.forEach((o) => {
      if (!o.created_at) return
      const d = new Date(o.created_at)
      const h = d.getHours()
      const slotIdx = Math.min(Math.floor(h / 3), 7)
      slots[slotIdx].count += 1
      slots[slotIdx].total += Number(o.total) || 0
    })

    chartItems.push(...slots)
  } else if (period === 'year' || period === 'all') {
    chartTitle = period === 'year' ? "Activité mensuelle de l'année" : "Activité mensuelle globale"
    chartSubtitle = 'Évolution du chiffre d’affaires et commandes mois par mois'

    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    const months = monthNames.map((m, idx) => ({ id: `m_${idx}`, label: m, count: 0, total: 0 }))

    filteredOrders.forEach((o) => {
      if (!o.created_at) return
      const d = new Date(o.created_at)
      const mIdx = d.getMonth()
      months[mIdx].count += 1
      months[mIdx].total += Number(o.total) || 0
    })

    chartItems.push(...months)
  } else {
    // 'week' ou 'month'
    const daysCount = period === 'month' ? 14 : 7
    chartTitle = period === 'month' ? 'Activité des 14 derniers jours' : 'Activité des 7 derniers jours'
    chartSubtitle = 'Chiffre d’affaires et commandes quotidiennes'

    const daysMap = new Map<string, { id: string; label: string; count: number; total: number }>()
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().split('T')[0]
      const dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
      daysMap.set(key, { id: key, label: dayLabel, count: 0, total: 0 })
    }

    filteredOrders.forEach((o) => {
      if (!o.created_at) return
      const key = o.created_at.split('T')[0]
      if (daysMap.has(key)) {
        const entry = daysMap.get(key)!
        entry.count += 1
        entry.total += Number(o.total) || 0
      }
    })

    chartItems.push(...Array.from(daysMap.values()))
  }

  const maxChartRevenue = Math.max(...chartItems.map((d) => d.total), 1)
  const chartTotalRevenue = chartItems.reduce((s, d) => s + d.total, 0)
  const chartTotalOrders = chartItems.reduce((s, d) => s + d.count, 0)

  // 11. Répartition par Villes réelles au Cameroun
  const cityCounts: Record<string, number> = {}
  Object.entries(storedCities).forEach(([cityName, count]) => {
    if (cityName && Number(count) > 0) {
      cityCounts[cityName] = (cityCounts[cityName] || 0) + Number(count)
    }
  })
  filteredOrders.forEach((o) => {
    const c = (o.shipping_address as any)?.city
    if (c) cityCounts[c] = (cityCounts[c] || 0) + 1
  })
  const totalCityReports = Object.values(cityCounts).reduce((a, b) => a + b, 0)

  // 12. Top Produits vendus réels selon la période
  const filteredOrderIds = new Set(filteredOrders.map((o) => o.id))
  const itemsToAnalyze = period === 'all' ? orderItems : orderItems.filter((i) => filteredOrderIds.has(i.order_id))

  const productSalesMap = new Map<string, { id: string; name: string; slug: string; image: string | null; price: number; unitsSold: number; totalGenerated: number }>()
  itemsToAnalyze.forEach((item) => {
    const pId = item.product_id
    if (!pId) return
    const snapshot = item.snapshot as any
    const productFromDb = products.find((prod) => prod.id === pId)

    const name = snapshot?.name || productFromDb?.name || 'Produit'
    const image = snapshot?.image || snapshot?.images?.[0] || productFromDb?.images?.[0] || null
    const slug = snapshot?.slug || productFromDb?.slug || ''
    const price = Number(item.unit_price) || Number(productFromDb?.price) || 0
    const qty = Number(item.quantity) || 1
    const total = Number(item.total_price) || price * qty

    if (productSalesMap.has(pId)) {
      const p = productSalesMap.get(pId)!
      p.unitsSold += qty
      p.totalGenerated += total
      if (!p.image && image) p.image = image
    } else {
      productSalesMap.set(pId, {
        id: pId,
        name,
        slug,
        image,
        price,
        unitsSold: qty,
        totalGenerated: total,
      })
    }
  })
  const topProducts = Array.from(productSalesMap.values()).slice(0, 5)

  // 13. Activité récente en direct
  const recentActivities = Array.isArray(rawAnalytics.recent_activity) ? rawAnalytics.recent_activity.slice(0, 8) : []

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">
      {/* ── EN-TÊTE RESPONSIVE AVEC FILTRES DE PÉRIODE ── */}
      <div className="flex flex-col gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
          <Link href="/admin" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            Administration
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 font-medium truncate">Analytics Suite</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Analytique & Audience
              </h1>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{activeNow} en direct</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Mesures de trafic, géolocalisation OpenStreetMap, temps d'engagement et conversion des ventes.
            </p>
          </div>

          <div className="shrink-0 self-start lg:self-auto flex items-center gap-2 flex-wrap">
            <AnalyticsHeaderActions />
          </div>
        </div>

        {/* ── BARRE DE SÉLECTION TEMPORELLE (AUJOURD'HUI / HIER / HEBDO / MENSUELLE / ANNUELLE) ── */}
        <div className="pt-2">
          <AnalyticsPeriodSelector currentPeriod={period} />
        </div>
      </div>

      {/* ── KPI METRICS CARDS (2 COLONNES SUR MOBILE, 4 SUR DESKTOP) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Chiffre d'Affaires */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                Chiffre d'Affaires
              </span>
              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 shrink-0" />
            </div>
            <p className="text-base sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {formatPrice(totalRevenue)}
            </p>
          </div>
          <div className="mt-2 text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 truncate">
            <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <span className="truncate">{formatPrice(collectedRevenue)} encaissé</span>
          </div>
        </div>

        {/* Durée Moyenne de Session */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                Durée / Session
              </span>
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 shrink-0" />
            </div>
            <p className="text-base sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {formatDuration(avgSessionSeconds)}
            </p>
          </div>
          <div className="mt-2 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
            <Compass className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Total : <strong>{formatDuration(totalEngagementSeconds)}</strong></span>
          </div>
        </div>

        {/* Taux d'Engagement */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                Engagement
              </span>
              <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-500 shrink-0" />
            </div>
            <p className="text-base sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {engagementRate} %
            </p>
          </div>
          <p className="mt-2 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
            Rebond : <strong className="text-slate-800 dark:text-slate-200">{bounceRate}%</strong>
          </p>
        </div>

        {/* Volume Sessions */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                Sessions & Pages
              </span>
              <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 shrink-0" />
            </div>
            <p className="text-base sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {totalSessions} <span className="text-xs font-normal text-slate-400">sessions</span>
            </p>
          </div>
          <p className="mt-2 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
            <strong>{pagesPerSession}</strong> page/session
          </p>
        </div>
      </div>

      {/* ── SECTION GOOGLE ANALYTICS : TEMPS PAR PAGE & AUDIENCE RÉCURRENTE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Tableau des Pages & Temps passé sur chaque page (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-2xs min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
              <Eye className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="truncate">Pages & Temps Passé (GA4)</span>
            </h2>
            <span className="text-xs font-medium text-slate-500 shrink-0">{totalPageViews} vues</span>
          </div>
          <p className="text-xs text-slate-400 mb-4 truncate">
            Durée moyenne de lecture passée sur chaque écran ({periodLabel})
          </p>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[320px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-2 pr-2">Page / URL</th>
                  <th className="py-2 px-2 text-right">Vues</th>
                  <th className="py-2 px-2 text-right hidden sm:table-cell">Part</th>
                  <th className="py-2 pl-2 text-right">Temps Moyen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {pagesList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                      Aucune page enregistrée pour cette période ({periodLabel}).
                    </td>
                  </tr>
                ) : (
                  pagesList.slice(0, 6).map((p) => (
                    <tr key={p.path} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 pr-2 font-mono font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px] sm:max-w-[280px]">
                        {p.path}
                      </td>
                      <td className="py-2.5 px-2 text-right font-semibold text-slate-900 dark:text-white">
                        {p.views}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                        {p.pct}%
                      </td>
                      <td className="py-2.5 pl-2 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px]">
                          <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          <span>{formatDuration(p.avgSeconds)}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fidélité : Nouveaux vs Récurrents (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-2xs flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                <Users className="h-4 w-4 text-indigo-500 shrink-0" />
                <span className="truncate">Fidélité de l'Audience</span>
              </h2>
              <span className="text-xs font-medium text-slate-500 shrink-0">{totalAudience} profil(s)</span>
            </div>
            <p className="text-xs text-slate-400 mb-4 truncate">
              Rétention des acheteurs et visiteurs
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                    <UserPlus className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Nouveaux Visiteurs</span>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{newVisitors} ({newVisitorsPct}%)</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div style={{ width: `${newVisitorsPct}%` }} className="h-full rounded-full bg-emerald-500" />
                </div>
                <p className="text-[10px] text-slate-400 pt-0.5">Première découverte de Bricelo</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                    <UserCheck className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span>Visiteurs Récurrents</span>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{returningVisitors} ({returningVisitorsPct}%)</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div style={{ width: `${returningVisitorsPct}%` }} className="h-full rounded-full bg-indigo-500" />
                </div>
                <p className="text-[10px] text-slate-400 pt-0.5">Utilisateurs revenus sur la boutique</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Mesure sans cookies tiers</span>
            <span className="font-medium text-slate-600 dark:text-slate-400">100% Souverain</span>
          </div>
        </div>
      </div>

      {/* ── SECTION : GRAPHIQUE SELON PÉRIODE & ACQUISITION DE TRAFIC ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Graphique d'activité dynamique (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-2xs flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                <BarChart3 className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="truncate">{chartTitle}</span>
              </h2>
              <span className="text-xs font-medium text-slate-500 shrink-0">Ventes réelles</span>
            </div>
            <p className="text-xs text-slate-400 mb-5 truncate">
              {chartSubtitle} : <strong className="text-slate-700 dark:text-slate-300">{formatPrice(chartTotalRevenue)}</strong> ({chartTotalOrders} commande{chartTotalOrders > 1 ? 's' : ''})
            </p>

            <div className="h-40 sm:h-52 w-full flex items-end justify-between gap-1 sm:gap-3 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              {chartItems.map((d) => {
                const heightPct = maxChartRevenue > 0 && d.total > 0
                  ? Math.max(Math.round((d.total / maxChartRevenue) * 100), 10)
                  : 4

                return (
                  <div key={d.id} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative min-w-0">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-slate-900 text-white text-[10px] font-semibold px-2 py-1 rounded shadow-md whitespace-nowrap border border-slate-800">
                      <p>{d.total > 0 ? formatPrice(d.total) : '0 FCFA'}</p>
                      <p className="text-[9px] text-amber-400 font-normal">{d.count} commande(s)</p>
                    </div>

                    <div className="w-full max-w-[36px] rounded-t-md bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-end h-full">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          d.total > 0
                            ? 'bg-amber-500 dark:bg-amber-400'
                            : 'bg-slate-200 dark:bg-slate-700/60'
                        }`}
                      />
                    </div>
                    <span className="text-[9px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 capitalize truncate w-full text-center">
                      {d.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
            <span>Montant en FCFA</span>
            <span>Direct DB</span>
          </div>
        </div>

        {/* Canaux d'Acquisition (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-2xs flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                <Share2 className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="truncate">Canaux d'Acquisition</span>
              </h2>
              <span className="text-xs font-medium text-slate-500 shrink-0">{totalTrafficVisits} visite(s)</span>
            </div>
            <p className="text-xs text-slate-400 mb-4 truncate">
              Origine du trafic ({periodLabel})
            </p>

            <div className="space-y-2.5 sm:space-y-3">
              {channels.map((ch) => {
                const pct = totalTrafficVisits > 0 ? Math.round((ch.count / totalTrafficVisits) * 100) : 0
                return (
                  <div key={ch.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-2">
                        {ch.name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-slate-400 text-[11px]">({ch.count})</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[28px] text-right">
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

            {/* Campagnes UTM */}
            {campaignList.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-2">Campagnes UTM :</p>
                <div className="space-y-1">
                  {campaignList.slice(0, 3).map((camp) => (
                    <div key={camp.name} className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate max-w-[160px] font-mono">{camp.name}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">{camp.count} clics</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] sm:text-[11px] text-slate-400">
            Dev/Localhost exclu automatiquement.
          </div>
        </div>
      </div>

      {/* ── SECTION ENTONNOIR & APPAREILS / NAVIGATEURS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Entonnoir E-commerce (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-2xs min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
              <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="truncate">Entonnoir E-commerce (Funnel)</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium shrink-0">Conversion</span>
          </div>
          <p className="text-xs text-slate-400 mb-5 truncate">
            Parcours de la visite jusqu'à l'achat finalisé
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
            {funnelSteps.map((f) => (
              <div
                key={f.step}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Étape {f.step}
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">
                      {f.percent}%
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate">
                    {f.label}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{f.count}</p>
                  <div className="h-1 w-full rounded-full bg-slate-200 dark:bg-slate-700 mt-1 overflow-hidden">
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

        {/* Technologies : Appareils & Navigateurs (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-2xs flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                <Smartphone className="h-4 w-4 text-indigo-500 shrink-0" />
                <span className="truncate">Technologies & Écrans</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium shrink-0">{totalDevices} sessions</span>
            </div>
            <p className="text-xs text-slate-400 mb-4 truncate">
              Systèmes et navigateurs utilisés
            </p>

            <div className="space-y-2.5 sm:space-y-3">
              {deviceList.map((dev) => {
                const Icon = dev.icon
                return (
                  <div key={dev.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 truncate pr-2">
                        <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{dev.label}</span>
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-slate-400 text-[11px]">({dev.count})</span>
                        <span className="font-semibold text-slate-900 dark:text-white min-w-[28px] text-right">
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

            {/* Navigateurs */}
            {browserList.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-2">Navigateurs :</p>
                <div className="space-y-1">
                  {browserList.map((b) => (
                    <div key={b.name} className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{b.name}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{b.pct}% ({b.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] sm:text-[11px] text-slate-400">
            Données anonymisées sans pistage invasif.
          </div>
        </div>
      </div>

      {/* ── SECTION CARTE INTERACTIVE OPENSTREETMAP (CAMEROUN LIVE & GÉOGRAPHIE) ── */}
      <AnalyticsMapClient liveSessions={liveSessionsMap} cityCounts={cityCounts} totalOrders={totalOrders} />

      {/* ── SECTION : VILLES CAMEROUN & TOP PRODUITS VENDUS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Villes de commande réelles (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-2xs min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
              <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
              <span className="truncate">Villes ({periodLabel})</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium shrink-0">{totalCityReports} adresse(s)</span>
          </div>
          <p className="text-xs text-slate-400 mb-4 truncate">
            Villes confirmées lors des commandes des clients
          </p>

          <div className="space-y-2">
            {Object.keys(cityCounts).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Aucune adresse de commande enregistrée pour cette période.
              </div>
            ) : (
              Object.entries(cityCounts).map(([cityName, count]) => {
                const pct = Math.round((count / Math.max(totalCityReports, 1)) * 100)
                return (
                  <div
                    key={cityName}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                      {cityName}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-400 text-[11px]">{count} commande(s)</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 min-w-[28px] text-right">
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
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-2xs min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
              <Package className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="truncate">Articles les Plus Vendus ({periodLabel})</span>
            </h2>
            <Link
              href="/admin/produits"
              className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Catalogue</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-slate-400 mb-4 truncate">
            Classement par volume de commandes réelles
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {topProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Aucun article commandé pour cette période.
              </div>
            ) : (
              topProducts.map((p, idx) => (
                <div key={p.id} className="py-2.5 sm:py-3 flex items-center justify-between gap-2.5 sm:gap-3 min-w-0">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <span className="text-xs font-semibold text-slate-400 w-4 text-center shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden relative shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      {p.image ? (
                        <Image src={p.image} alt={p.name} fill className="object-cover" unoptimized />
                      ) : (
                        <Package className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {p.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
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

      {/* ── SECTION : FLUX D'ACTIVITÉ EN TEMPS RÉEL (RESPONSIVE) ── */}
      {recentActivities.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-2xs min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
              <Activity className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="truncate">Flux d'Activité en Direct</span>
            </h2>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              Direct
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-3 truncate">
            Dernières actions enregistrées sur la boutique
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentActivities.map((act: any, i: number) => {
              const diffSecs = Math.max(1, Math.round((now - act.timestamp) / 1000))
              const timeAgo = diffSecs < 60 ? `Il y a ${diffSecs}s` : `Il y a ${Math.round(diffSecs / 60)} min`
              return (
                <div key={i} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 sm:gap-3 min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-semibold text-slate-900 dark:text-white shrink-0">
                      {act.event_name || 'Visite'}
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-400 truncate text-[11px]">
                      {act.path}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-[11px] text-slate-400 pl-4 sm:pl-0">
                    <span>{act.device}</span>
                    <span>•</span>
                    <span className="font-medium text-slate-500">{act.channel}</span>
                    <span>•</span>
                    <span className="text-slate-400">{timeAgo}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
  } catch (err: any) {
    if ((err as any)?.digest?.includes('NEXT_REDIRECT') || (err as any)?.message === 'NEXT_REDIRECT') {
      throw err
    }
    console.error('Fatal AdminAnalyticsPage error:', err)
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="p-6 bg-amber-50 dark:bg-slate-900 border border-amber-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white">
          <h2 className="font-bold text-base mb-1 text-amber-700 dark:text-amber-400">Diagnostic Analytics</h2>
          <p className="text-xs text-slate-500 mb-3">Une erreur est survenue lors de la compilation des données :</p>
          <pre className="p-3 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-xs overflow-x-auto text-rose-600 font-mono">
            {err?.stack || err?.message || String(err)}
          </pre>
          <div className="mt-4">
            <Link href="/admin/analytics" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow transition-colors inline-block">
              Actualiser la page
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
