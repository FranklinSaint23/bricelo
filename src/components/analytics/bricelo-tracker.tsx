'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function BriceloTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedPath = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Ne JAMAIS tracer en local / développement pour ne pas fausser les stats
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return

    // Ne pas tracer les pages de l'espace administration ni les routes API
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return

    // Ne pas tracer si l'utilisateur est un administrateur connecté
    if (
      document.cookie.includes('bricelo_is_admin') ||
      localStorage.getItem('bricelo_is_admin') === 'true' ||
      sessionStorage.getItem('bricelo_is_admin') === 'true'
    ) {
      return
    }

    // 1. Récupération ou création des identifiants anonymes
    let visitorId = localStorage.getItem('bricelo_vid')
    let isReturning = false
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36)
      localStorage.setItem('bricelo_vid', visitorId)
    } else {
      isReturning = true
    }

    let sessionId = sessionStorage.getItem('bricelo_sid')
    if (!sessionId) {
      sessionId = 's_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
      sessionStorage.setItem('bricelo_sid', sessionId)
    }

    // 2. Détection du canal d'acquisition (D'où vient le visiteur)
    const ref = document.referrer.toLowerCase()
    const urlParams = searchParams?.toString().toLowerCase() || ''
    const utmSource = searchParams?.get('utm_source') || undefined
    const utmCampaign = searchParams?.get('utm_campaign') || undefined

    let channel: 'WhatsApp' | 'Facebook' | 'Instagram' | 'TikTok' | 'Google' | 'Direct' | 'Autre' = 'Direct'

    if (urlParams.includes('utm_source=whatsapp') || ref.includes('whatsapp') || ref.includes('wa.me')) {
      channel = 'WhatsApp'
    } else if (urlParams.includes('utm_source=facebook') || ref.includes('facebook') || ref.includes('fb.me')) {
      channel = 'Facebook'
    } else if (urlParams.includes('utm_source=instagram') || ref.includes('instagram')) {
      channel = 'Instagram'
    } else if (urlParams.includes('utm_source=tiktok') || ref.includes('tiktok')) {
      channel = 'TikTok'
    } else if (ref.includes('google.') || ref.includes('bing.') || urlParams.includes('utm_source=google')) {
      channel = 'Google'
    } else if (ref && !ref.includes(window.location.hostname)) {
      channel = 'Autre'
    }

    // 3. Détection de l'appareil (Mobile Android vs iPhone vs PC)
    const ua = navigator.userAgent.toLowerCase()
    let device: 'Mobile Android' | 'Mobile iPhone' | 'Ordinateur' | 'Tablette' = 'Ordinateur'

    if (/android/.test(ua)) {
      device = /mobile/.test(ua) ? 'Mobile Android' : 'Tablette'
    } else if (/iphone|ipod/.test(ua)) {
      device = 'Mobile iPhone'
    } else if (/ipad/.test(ua)) {
      device = 'Tablette'
    }

    // Navigateur
    let browser = 'Autre'
    if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome'
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari'
    else if (ua.includes('firefox')) browser = 'Firefox'
    else if (ua.includes('edg')) browser = 'Edge'

    // 4. Ville du client (uniquement si enregistrée lors d'une commande ou profil)
    let city: string | undefined = undefined
    try {
      const storedCity = localStorage.getItem('bricelo_user_city')
      if (storedCity) {
        city = storedCity
      }
    } catch {
      // Ignore
    }

    const currentUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')

    // Éviter les doubles envois immédiats de page_view sur la même URL
    const isNewPageView = lastTrackedPath.current !== currentUrl
    if (isNewPageView) {
      lastTrackedPath.current = currentUrl

      const pageViewPayload = {
        type: 'page_view',
        path: pathname,
        visitor_id: visitorId,
        session_id: sessionId,
        is_returning: isReturning,
        channel,
        device,
        browser,
        utm_source: utmSource,
        utm_campaign: utmCampaign,
        city,
      }

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/collect', JSON.stringify(pageViewPayload))
      } else {
        fetch('/api/analytics/collect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pageViewPayload),
          keepalive: true,
        }).catch(() => {})
      }
    }

    // 5. Suivi du TEMPS SUR LA PAGE & ENGAGEMENT (Style Google Analytics)
    let lastHeartbeatTime = Date.now()

    const sendEngagementTime = (isFinal = false) => {
      const now = Date.now()
      const elapsedSeconds = Math.round((now - lastHeartbeatTime) / 1000)
      if (elapsedSeconds < 2) return // Trop court pour être comptabilisé

      lastHeartbeatTime = now
      const heartbeatPayload = {
        type: 'heartbeat',
        path: pathname,
        visitor_id: visitorId,
        session_id: sessionId,
        duration_seconds: elapsedSeconds,
        channel,
        device,
        browser,
        city,
      }

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/collect', JSON.stringify(heartbeatPayload))
      } else {
        fetch('/api/analytics/collect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(heartbeatPayload),
          keepalive: true,
        }).catch(() => {})
      }
    }

    // Battement de cœur toutes les 15 secondes si l'onglet est actif
    const heartbeatInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        sendEngagementTime(false)
      }
    }, 15000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendEngagementTime(true)
      } else {
        lastHeartbeatTime = Date.now()
      }
    }

    const handleBeforeUnload = () => {
      sendEngagementTime(true)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handleBeforeUnload)

    return () => {
      clearInterval(heartbeatInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handleBeforeUnload)
      sendEngagementTime(true)
    }
  }, [pathname, searchParams])

  return null
}
