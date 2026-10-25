import { type NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

interface AnalyticsPayload {
  type: 'page_view' | 'event'
  event_name?: string
  path: string
  visitor_id: string
  session_id: string
  channel: 'WhatsApp' | 'Facebook' | 'Instagram' | 'TikTok' | 'Google' | 'Direct' | 'Autre'
  device: 'Mobile Android' | 'Mobile iPhone' | 'Ordinateur' | 'Tablette'
  browser: string
  city?: string
  data?: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as AnalyticsPayload
    if (!payload || !payload.path || !payload.visitor_id) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // Ne pas comptabiliser les pages admin pour ne pas fausser les stats
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

    // Structure de base
    const analytics = {
      today_date: raw.today_date === todayStr ? raw.today_date : todayStr,
      live_sessions: raw.live_sessions || {},
      visitors: {
        total: (raw.visitors?.total || 0) + (payload.type === 'page_view' ? 1 : 0),
        today: (raw.today_date === todayStr ? (raw.visitors?.today || 0) : 0) + 1,
      },
      channels: {
        whatsapp: (raw.channels?.whatsapp || 0) + (payload.channel === 'WhatsApp' ? 1 : 0),
        facebook: (raw.channels?.facebook || 0) + (payload.channel === 'Facebook' ? 1 : 0),
        instagram: (raw.channels?.instagram || 0) + (payload.channel === 'Instagram' ? 1 : 0),
        tiktok: (raw.channels?.tiktok || 0) + (payload.channel === 'TikTok' ? 1 : 0),
        google: (raw.channels?.google || 0) + (payload.channel === 'Google' ? 1 : 0),
        direct: (raw.channels?.direct || 0) + (payload.channel === 'Direct' ? 1 : 0),
        other: (raw.channels?.other || 0) + (payload.channel === 'Autre' ? 1 : 0),
      },
      devices: {
        android: (raw.devices?.android || 0) + (payload.device === 'Mobile Android' ? 1 : 0),
        ios: (raw.devices?.ios || 0) + (payload.device === 'Mobile iPhone' ? 1 : 0),
        desktop: (raw.devices?.desktop || 0) + (payload.device === 'Ordinateur' ? 1 : 0),
        tablet: (raw.devices?.tablet || 0) + (payload.device === 'Tablette' ? 1 : 0),
      },
      cities: {
        ...(raw.cities || {}),
      },
      top_pages: {
        ...(raw.top_pages || {}),
      },
      funnel: {
        visitors: (raw.funnel?.visitors || 0) + 1,
        product_views: (raw.funnel?.product_views || 0) + (payload.path.includes('/produit/') ? 1 : 0),
        cart_adds: (raw.funnel?.cart_adds || 0) + (payload.event_name === 'add_to_cart' ? 1 : 0),
        checkout_starts: (raw.funnel?.checkout_starts || 0) + (payload.path.includes('/checkout') ? 1 : 0),
        orders_completed: raw.funnel?.orders_completed || 0,
      },
      recent_activity: Array.isArray(raw.recent_activity) ? raw.recent_activity : [],
    }

    // Gestion du direct live session (sessions actives dans les 5 minutes)
    analytics.live_sessions[payload.session_id] = now
    const cutoff = now - 5 * 60 * 1000 // 5 minutes
    Object.keys(analytics.live_sessions).forEach((sid) => {
      if (analytics.live_sessions[sid] < cutoff) {
        delete analytics.live_sessions[sid]
      }
    })

    // Mise à jour de la ville
    const city = payload.city || 'Douala'
    analytics.cities[city] = (analytics.cities[city] || 0) + 1

    // Mise à jour top pages
    const cleanPath = payload.path.split('?')[0]
    const currentCount = analytics.top_pages[cleanPath] || 0
    analytics.top_pages[cleanPath] = currentCount + 1

    // Ajout à l'activité récente (on garde les 15 dernières)
    analytics.recent_activity.unshift({
      type: payload.type,
      event_name: payload.event_name || 'Visite',
      path: cleanPath,
      channel: payload.channel,
      device: payload.device,
      city,
      timestamp: now,
    })
    analytics.recent_activity = analytics.recent_activity.slice(0, 15)

    // Sauvegarde atomique dans system_settings
    await supabase.from('system_settings').upsert({
      key: 'bricelo_analytics_store',
      value: analytics,
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true, active_now: Object.keys(analytics.live_sessions).length })
  } catch (err) {
    console.error('[analytics_collect_error]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
