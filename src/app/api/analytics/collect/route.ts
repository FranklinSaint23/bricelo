import { type NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

interface AnalyticsPayload {
  type: 'page_view' | 'heartbeat' | 'ping' | 'event'
  event_name?: string
  path: string
  visitor_id: string
  session_id: string
  is_returning?: boolean
  duration_seconds?: number
  channel: 'WhatsApp' | 'Facebook' | 'Instagram' | 'TikTok' | 'Google' | 'Direct' | 'Autre'
  device: 'Mobile Android' | 'Mobile iPhone' | 'Ordinateur' | 'Tablette'
  browser: string
  utm_source?: string
  utm_campaign?: string
  city?: string
  data?: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as AnalyticsPayload
    if (!payload || !payload.path || !payload.visitor_id) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // Ne pas comptabiliser les pages admin ni les routes API
    if (payload.path.startsWith('/admin') || payload.path.startsWith('/api')) {
      return NextResponse.json({ ok: true, ignored: true })
    }

    const supabase = getAdminClient()
    const now = Date.now()
    const todayStr = new Date().toISOString().split('T')[0]

    // Récupérer les analytics actuels
    const { data: record } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'bricelo_analytics_store')
      .maybeSingle()

    const raw = (record?.value as any) || {}
    const isNewDay = raw.today_date !== todayStr

    // Nettoyage de l'URL
    const cleanPath = payload.path.split('?')[0]

    // Normalisation de top_pages
    const topPages: Record<string, { views: number; total_seconds: number }> = {}
    if (raw.top_pages && typeof raw.top_pages === 'object') {
      Object.entries(raw.top_pages).forEach(([p, val]) => {
        if (typeof val === 'number') {
          topPages[p] = { views: val, total_seconds: 0 }
        } else if (val && typeof val === 'object') {
          topPages[p] = {
            views: Number((val as any).views) || 0,
            total_seconds: Number((val as any).total_seconds) || 0,
          }
        }
      })
    }

    // Inférence de la ville si présente dans le payload ou les en-têtes (Vercel / Cloudflare)
    const headerCity =
      request.headers.get('x-vercel-ip-city') ||
      request.headers.get('cf-ipcity') ||
      undefined
    const headerRegion = request.headers.get('x-vercel-ip-country-region')

    let effectiveCity: string | undefined = payload.city
    if (!effectiveCity) {
      if (headerRegion === 'CE' || headerRegion === 'Centre') {
        effectiveCity = 'Yaoundé'
      } else if (headerRegion === 'LT' || headerRegion === 'Littoral') {
        effectiveCity = 'Douala'
      } else if (headerRegion === 'OU' || headerRegion === 'Ouest') {
        effectiveCity = 'Bafoussam'
      } else if (headerRegion === 'NO' || headerRegion === 'Nord') {
        effectiveCity = 'Garoua'
      } else if (headerRegion === 'EN') {
        effectiveCity = 'Maroua'
      } else if (headerCity) {
        effectiveCity = decodeURIComponent(headerCity)
      }
    }

    const currentLive: Record<string, any> = raw.live_sessions || {}
    currentLive[payload.session_id] = {
      timestamp: now,
      city: effectiveCity,
      path: cleanPath,
      device: payload.device,
      channel: payload.channel,
    }
    const cutoff = now - 5 * 60 * 1000 // 5 minutes
    Object.keys(currentLive).forEach((sid) => {
      const item = currentLive[sid]
      const ts = typeof item === 'number' ? item : (item?.timestamp || 0)
      if (ts < cutoff) {
        delete currentLive[sid]
      }
    })

    const rawEngagement = raw.engagement || {}
    const rawSessions = raw.sessions || {}
    const rawAudience = raw.audience || {}
    const rawBrowsers = raw.browsers || {}
    const rawCampaigns = raw.campaigns || {}
    const rawDailyHistory = raw.daily_history || {}

    // Détection nouvelle session
    const isNewSession = !rawSessions.active_ids || !rawSessions.active_ids[payload.session_id]
    const updatedActiveIds = {
      ...(isNewDay ? {} : (rawSessions.active_ids || {})),
      [payload.session_id]: true,
    }

    // Sessions engagées (> 10s ou > 1 page)
    const engagedSessions = rawEngagement.engaged_sessions || {}
    const sessionSeconds = rawEngagement.session_seconds || {}

    // Initialisation page dans top_pages si inexistante
    if (!topPages[cleanPath]) {
      topPages[cleanPath] = { views: 0, total_seconds: 0 }
    }

    let addedSeconds = 0
    if (payload.type === 'heartbeat' && payload.duration_seconds) {
      addedSeconds = Math.min(Math.max(Number(payload.duration_seconds), 1), 120)
    }

    if (addedSeconds > 0) {
      topPages[cleanPath].total_seconds += addedSeconds
      sessionSeconds[payload.session_id] = (sessionSeconds[payload.session_id] || 0) + addedSeconds
      if (sessionSeconds[payload.session_id] >= 10) {
        engagedSessions[payload.session_id] = true
      }
    }

    if (payload.type === 'page_view') {
      topPages[cleanPath].views += 1
      // Si la session consulte plusieurs pages, elle est automatiquement engagée
      const prevViews = (raw.visitors?.session_page_views?.[payload.session_id] || 0) + 1
      if (prevViews >= 2) {
        engagedSessions[payload.session_id] = true
      }
    }

    // Normalisation des navigateurs
    const bLower = (payload.browser || 'Autre').toLowerCase()
    let browserKey: 'chrome' | 'safari' | 'firefox' | 'edge' | 'other' = 'other'
    if (bLower.includes('chrome')) browserKey = 'chrome'
    else if (bLower.includes('safari')) browserKey = 'safari'
    else if (bLower.includes('firefox')) browserKey = 'firefox'
    else if (bLower.includes('edg')) browserKey = 'edge'

    // UTM tracking
    if (payload.utm_source) {
      const campKey = `${payload.utm_source}${payload.utm_campaign ? ` / ${payload.utm_campaign}` : ''}`
      rawCampaigns[campKey] = (rawCampaigns[campKey] || 0) + 1
    }

    // Historique Quotidien (Daily History pour filtres Aujourd'hui, Hier, 7j, 30j, Année)
    const currentHour = String(new Date().getHours()).padStart(2, '0')
    if (!rawDailyHistory[todayStr]) {
      rawDailyHistory[todayStr] = {
        date: todayStr,
        views: 0,
        sessions: 0,
        new_visitors: 0,
        returning_visitors: 0,
        total_seconds: 0,
        engaged_sessions: 0,
        channels: {},
        devices: {},
        browsers: {},
        cities: {},
        top_pages: {},
        hours: {},
      }
    }
    const todayRecord = rawDailyHistory[todayStr]

    if (payload.type === 'page_view') {
      todayRecord.views = (todayRecord.views || 0) + 1
      todayRecord.hours[currentHour] = (todayRecord.hours[currentHour] || 0) + 1
      if (isNewSession) todayRecord.sessions = (todayRecord.sessions || 0) + 1
      if (payload.is_returning) {
        todayRecord.returning_visitors = (todayRecord.returning_visitors || 0) + 1
      } else {
        todayRecord.new_visitors = (todayRecord.new_visitors || 0) + 1
      }
      todayRecord.channels[payload.channel] = (todayRecord.channels[payload.channel] || 0) + 1
      todayRecord.devices[payload.device] = (todayRecord.devices[payload.device] || 0) + 1
      todayRecord.browsers[browserKey] = (todayRecord.browsers[browserKey] || 0) + 1
      if (effectiveCity) {
        todayRecord.cities[effectiveCity] = (todayRecord.cities[effectiveCity] || 0) + 1
      }
      if (!todayRecord.top_pages[cleanPath]) {
        todayRecord.top_pages[cleanPath] = { views: 0, total_seconds: 0 }
      }
      todayRecord.top_pages[cleanPath].views += 1
    }

    if (addedSeconds > 0) {
      todayRecord.total_seconds = (todayRecord.total_seconds || 0) + addedSeconds
      if (!todayRecord.top_pages[cleanPath]) {
        todayRecord.top_pages[cleanPath] = { views: 0, total_seconds: 0 }
      }
      todayRecord.top_pages[cleanPath].total_seconds += addedSeconds
    }

    const analytics = {
      today_date: todayStr,
      live_sessions: currentLive,
      daily_history: rawDailyHistory,
      sessions: {
        total: (rawSessions.total || 0) + (isNewSession ? 1 : 0),
        today: (isNewDay ? 0 : (rawSessions.today || 0)) + (isNewSession ? 1 : 0),
        active_ids: updatedActiveIds,
      },
      visitors: {
        total: (raw.visitors?.total || 0) + (payload.type === 'page_view' ? 1 : 0),
        today: (isNewDay ? 0 : (raw.visitors?.today || 0)) + (payload.type === 'page_view' ? 1 : 0),
        session_page_views: {
          ...(isNewDay ? {} : (raw.visitors?.session_page_views || {})),
          [payload.session_id]: ((raw.visitors?.session_page_views?.[payload.session_id] || 0) + (payload.type === 'page_view' ? 1 : 0)),
        },
      },
      audience: {
        new_visitors: (rawAudience.new_visitors || 0) + (payload.type === 'page_view' && !payload.is_returning ? 1 : 0),
        returning_visitors: (rawAudience.returning_visitors || 0) + (payload.type === 'page_view' && payload.is_returning ? 1 : 0),
      },
      engagement: {
        total_seconds: (rawEngagement.total_seconds || 0) + addedSeconds,
        session_seconds: sessionSeconds,
        engaged_sessions: engagedSessions,
      },
      channels: {
        whatsapp: (raw.channels?.whatsapp || 0) + (payload.channel === 'WhatsApp' && payload.type === 'page_view' ? 1 : 0),
        facebook: (raw.channels?.facebook || 0) + (payload.channel === 'Facebook' && payload.type === 'page_view' ? 1 : 0),
        instagram: (raw.channels?.instagram || 0) + (payload.channel === 'Instagram' && payload.type === 'page_view' ? 1 : 0),
        tiktok: (raw.channels?.tiktok || 0) + (payload.channel === 'TikTok' && payload.type === 'page_view' ? 1 : 0),
        google: (raw.channels?.google || 0) + (payload.channel === 'Google' && payload.type === 'page_view' ? 1 : 0),
        direct: (raw.channels?.direct || 0) + (payload.channel === 'Direct' && payload.type === 'page_view' ? 1 : 0),
        other: (raw.channels?.other || 0) + (payload.channel === 'Autre' && payload.type === 'page_view' ? 1 : 0),
      },
      campaigns: rawCampaigns,
      devices: {
        android: (raw.devices?.android || 0) + (payload.device === 'Mobile Android' && payload.type === 'page_view' ? 1 : 0),
        ios: (raw.devices?.ios || 0) + (payload.device === 'Mobile iPhone' && payload.type === 'page_view' ? 1 : 0),
        desktop: (raw.devices?.desktop || 0) + (payload.device === 'Ordinateur' && payload.type === 'page_view' ? 1 : 0),
        tablet: (raw.devices?.tablet || 0) + (payload.device === 'Tablette' && payload.type === 'page_view' ? 1 : 0),
      },
      browsers: {
        chrome: (rawBrowsers.chrome || 0) + (browserKey === 'chrome' && payload.type === 'page_view' ? 1 : 0),
        safari: (rawBrowsers.safari || 0) + (browserKey === 'safari' && payload.type === 'page_view' ? 1 : 0),
        firefox: (rawBrowsers.firefox || 0) + (browserKey === 'firefox' && payload.type === 'page_view' ? 1 : 0),
        edge: (rawBrowsers.edge || 0) + (browserKey === 'edge' && payload.type === 'page_view' ? 1 : 0),
        other: (rawBrowsers.other || 0) + (browserKey === 'other' && payload.type === 'page_view' ? 1 : 0),
      },
      cities: {
        ...(raw.cities || {}),
        ...(payload.city ? { [payload.city]: ((raw.cities || {})[payload.city] || 0) + (payload.type === 'page_view' ? 1 : 0) } : {}),
      },
      top_pages: topPages,
      funnel: {
        visitors: (raw.funnel?.visitors || 0) + (payload.type === 'page_view' ? 1 : 0),
        product_views: (raw.funnel?.product_views || 0) + (payload.type === 'page_view' && payload.path.includes('/produit/') ? 1 : 0),
        cart_adds: (raw.funnel?.cart_adds || 0) + (payload.event_name === 'add_to_cart' ? 1 : 0),
        checkout_starts: (raw.funnel?.checkout_starts || 0) + (payload.type === 'page_view' && payload.path.includes('/checkout') ? 1 : 0),
        orders_completed: raw.funnel?.orders_completed || 0,
      },
      recent_activity: Array.isArray(raw.recent_activity) ? raw.recent_activity : [],
    }

    // Ajout à l'activité récente (on garde les 20 dernières)
    if (payload.type === 'page_view' || payload.event_name) {
      analytics.recent_activity.unshift({
        type: payload.type,
        event_name: payload.event_name || 'Consultation de page',
        path: cleanPath,
        channel: payload.channel,
        device: payload.device,
        browser: payload.browser,
        city: payload.city || null,
        timestamp: now,
      })
      analytics.recent_activity = analytics.recent_activity.slice(0, 20)
    }

    // Sauvegarde dans system_settings
    await supabase.from('system_settings').upsert({
      key: 'bricelo_analytics_store',
      value: analytics,
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json({
      ok: true,
      active_now: Object.keys(currentLive).length,
    })
  } catch (err) {
    console.error('[analytics_collect_error]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
