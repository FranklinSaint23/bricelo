'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function BriceloTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedPath = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Ne pas tracer les pages de l'espace administration
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return

    // 1. Récupération ou création des identifiants anonymes
    let visitorId = localStorage.getItem('bricelo_vid')
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36)
      localStorage.setItem('bricelo_vid', visitorId)
    }

    let sessionId = sessionStorage.getItem('bricelo_sid')
    if (!sessionId) {
      sessionId = 's_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
      sessionStorage.setItem('bricelo_sid', sessionId)
    }

    // 2. Détection du canal d'acquisition (D'où vient le visiteur)
    const ref = document.referrer.toLowerCase()
    const urlParams = searchParams?.toString().toLowerCase() || ''

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
    if (ua.includes('chrome')) browser = 'Chrome'
    else if (ua.includes('safari')) browser = 'Safari'
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

    // Éviter les doubles envois immédiats sur la même URL
    if (lastTrackedPath.current === currentUrl) return
    lastTrackedPath.current = currentUrl

    const payload = {
      type: 'page_view',
      path: pathname,
      visitor_id: visitorId,
      session_id: sessionId,
      channel,
      device,
      browser,
      city,
    }

    // Envoi fluide en arrière-plan sans bloquer l'UI
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/collect', JSON.stringify(payload))
    } else {
      fetch('/api/analytics/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {})
    }

    // Ping régulier de présence (toutes les 2 minutes pour le compteur en direct)
    const interval = setInterval(() => {
      fetch('/api/analytics/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          type: 'ping',
        }),
        keepalive: true,
      }).catch(() => {})
    }, 120000)

    return () => clearInterval(interval)
  }, [pathname, searchParams])

  return null
}
