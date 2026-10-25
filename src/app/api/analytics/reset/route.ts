import { type NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient()
    const todayStr = new Date().toISOString().split('T')[0]

    const emptyAnalytics = {
      today_date: todayStr,
      live_sessions: {},
      sessions: {
        total: 0,
        today: 0,
        active_ids: {},
      },
      visitors: {
        total: 0,
        today: 0,
        session_page_views: {},
      },
      audience: {
        new_visitors: 0,
        returning_visitors: 0,
      },
      engagement: {
        total_seconds: 0,
        session_seconds: {},
        engaged_sessions: {},
      },
      channels: {
        whatsapp: 0,
        facebook: 0,
        instagram: 0,
        tiktok: 0,
        google: 0,
        direct: 0,
        other: 0,
      },
      campaigns: {},
      devices: {
        android: 0,
        ios: 0,
        desktop: 0,
        tablet: 0,
      },
      browsers: {
        chrome: 0,
        safari: 0,
        firefox: 0,
        edge: 0,
        other: 0,
      },
      cities: {},
      top_pages: {},
      funnel: {
        visitors: 0,
        product_views: 0,
        cart_adds: 0,
        checkout_starts: 0,
        orders_completed: 0,
      },
      recent_activity: [],
    }

    await supabase.from('system_settings').upsert({
      key: 'bricelo_analytics_store',
      value: emptyAnalytics,
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true, message: 'Analytics réinitialisés à 0' })
  } catch (err) {
    console.error('[analytics_reset_error]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
