'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, Compass, Layers, Radio, Users, ShoppingBag } from 'lucide-react'

// Coordonnées GPS réelles des principales villes du Cameroun
export const CAMEROON_CITIES: Record<string, { lat: number; lng: number; name: string; region: string }> = {
  'Douala': { lat: 4.0511, lng: 9.7679, name: 'Douala', region: 'Littoral' },
  'Yaoundé': { lat: 3.8480, lng: 11.5021, name: 'Yaoundé', region: 'Centre' },
  'Yaounde': { lat: 3.8480, lng: 11.5021, name: 'Yaoundé', region: 'Centre' },
  'Bafoussam': { lat: 5.4778, lng: 10.4176, name: 'Bafoussam', region: 'Ouest' },
  'Bamenda': { lat: 5.9631, lng: 10.1591, name: 'Bamenda', region: 'Nord-Ouest' },
  'Garoua': { lat: 9.3014, lng: 13.3977, name: 'Garoua', region: 'Nord' },
  'Maroua': { lat: 10.5956, lng: 14.3247, name: 'Maroua', region: 'Extrême-Nord' },
  'Ngaoundéré': { lat: 7.3195, lng: 13.5841, name: 'Ngaoundéré', region: 'Adamaoua' },
  'Ngaoundere': { lat: 7.3195, lng: 13.5841, name: 'Ngaoundéré', region: 'Adamaoua' },
  'Kribi': { lat: 2.9392, lng: 9.9103, name: 'Kribi', region: 'Sud' },
  'Limbe': { lat: 4.0244, lng: 9.2140, name: 'Limbe', region: 'Sud-Ouest' },
  'Buea': { lat: 4.1560, lng: 9.2435, name: 'Buea', region: 'Sud-Ouest' },
  'Bertoua': { lat: 4.5773, lng: 13.6846, name: 'Bertoua', region: 'Est' },
  'Ebolowa': { lat: 2.9000, lng: 11.1500, name: 'Ebolowa', region: 'Sud' },
  'Dschang': { lat: 5.4500, lng: 10.0500, name: 'Dschang', region: 'Ouest' },
  'Edéa': { lat: 3.8000, lng: 10.1333, name: 'Edéa', region: 'Littoral' },
  'Edea': { lat: 3.8000, lng: 10.1333, name: 'Edéa', region: 'Littoral' },
  'Kumba': { lat: 4.6333, lng: 9.4500, name: 'Kumba', region: 'Sud-Ouest' },
  'Nkongsamba': { lat: 4.9500, lng: 9.9333, name: 'Nkongsamba', region: 'Littoral' },
  'Foumban': { lat: 5.7167, lng: 10.9000, name: 'Foumban', region: 'Ouest' },
}

interface CityData {
  name: string
  region: string
  lat: number
  lng: number
  liveCount: number
  orderCount: number
  visitCount: number
}

interface AnalyticsMapProps {
  liveSessions: Record<string, { timestamp: number; city?: string; path?: string; device?: string }>
  cityCounts: Record<string, number>
  totalOrders: number
}

export function AnalyticsMap({ liveSessions = {}, cityCounts = {}, totalOrders = 0 }: AnalyticsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // 1. Calcul des visiteurs en direct par ville
  const now = Date.now()
  const cutoff = now - 5 * 60 * 1000 // 5 minutes
  const liveByCity: Record<string, number> = {}

  let totalActive = 0
  Object.values(liveSessions || {}).forEach((sess: any) => {
    const ts = typeof sess === 'number' ? sess : (sess?.timestamp || 0)
    if (ts >= cutoff) {
      totalActive += 1
      const rawCity = sess?.city
      if (rawCity && typeof rawCity === 'string') {
        const normCity = decodeURIComponent(rawCity).trim()
        if (normCity && normCity !== 'undefined' && normCity !== 'null') {
          liveByCity[normCity] = (liveByCity[normCity] || 0) + 1
        }
      }
    }
  })

  // 2. Préparation des données par ville
  const cityDataList: CityData[] = []
  const knownCities = new Set<string>()

  Object.keys(liveByCity).forEach((cityName) => {
    knownCities.add(cityName)
  })

  Object.keys(cityCounts || {}).forEach((cityName) => {
    knownCities.add(cityName)
  })

  // Toujours proposer les deux métropoles phares pour la navigation
  knownCities.add('Yaoundé')
  knownCities.add('Douala')

  knownCities.forEach((cName) => {
    const coords = CAMEROON_CITIES[cName]
    if (!coords) return
    cityDataList.push({
      name: coords.name,
      region: coords.region,
      lat: coords.lat,
      lng: coords.lng,
      liveCount: liveByCity[cName] || liveByCity[coords.name] || 0,
      orderCount: cityCounts[cName] || cityCounts[coords.name] || 0,
      visitCount: (cityCounts[cName] || 0) + (liveByCity[cName] || 0),
    })
  })

  const uniqueCitiesMap = new Map<string, CityData>()
  cityDataList.forEach((c) => {
    if (uniqueCitiesMap.has(c.name)) {
      const existing = uniqueCitiesMap.get(c.name)!
      existing.liveCount += c.liveCount
      existing.orderCount += c.orderCount
      existing.visitCount += c.visitCount
    } else {
      uniqueCitiesMap.set(c.name, { ...c })
    }
  })
  const cities = Array.from(uniqueCitiesMap.values())

  // Initialisation de Leaflet OpenStreetMap 100% côté client via injection script pour éviter tout crash SSR
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return

    let isMounted = true

    const initMap = (L: any) => {
      if (!isMounted || !mapContainerRef.current) return

      // Nettoyer instance précédente si existante
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
        } catch {}
        mapInstanceRef.current = null
      }
      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null
      }

      const CAMEROON_BOUNDS: [[number, number], [number, number]] = [
        [1.5, 8.2],   // Sud-Ouest (Frontière Sud Cameroun)
        [13.2, 16.4], // Nord-Est (Extrême-Nord / Lac Tchad)
      ]
      let map: any = null
      try {
        map = L.map(mapContainerRef.current, {
          maxBounds: CAMEROON_BOUNDS,
          maxBoundsViscosity: 1.0,
          minZoom: 5.8,
          maxZoom: 16,
          zoomControl: false,
          attributionControl: false,
        })
        map.fitBounds(CAMEROON_BOUNDS, { padding: [10, 10] })
      } catch (mapErr) {
        console.error('Erreur initialisation Leaflet:', mapErr)
        return
      }

      L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abc',
        maxZoom: 20,
      }).addTo(map)

      L.control.zoom({ position: 'topright' }).addTo(map)

      // Ajout des marqueurs sur la carte
      cities.forEach((city) => {
        const isLive = city.liveCount > 0

        if (isLive) {
          const liveIcon = L.divIcon({
            className: 'osm-live-marker',
            html: `
              <div class="relative flex items-center justify-center cursor-pointer group">
                <span class="absolute h-9 w-9 rounded-full bg-blue-500/50 animate-ping"></span>
                <span class="absolute h-6 w-6 rounded-full bg-blue-400/60 animate-pulse"></span>
                <span class="relative h-4 w-4 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center">
                  <span class="h-1.5 w-1.5 rounded-full bg-white"></span>
                </span>
                <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-900/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                  ${city.name} (${city.liveCount})
                </div>
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          })

          const marker = L.marker([city.lat, city.lng], { icon: liveIcon }).addTo(map)
          marker.bindPopup(`
            <div style="font-family: inherit; padding: 2px;">
              <h4 style="margin: 0; font-size: 13px; font-weight: bold; color: #0f172a;">${city.name}</h4>
              <p style="margin: 2px 0 6px; font-size: 11px; color: #64748b;">Région du ${city.region}</p>
              <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: bold; color: #2563eb; background: #eff6ff; padding: 4px 8px; border-radius: 6px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #2563eb;"></span>
                <span>${city.liveCount} visiteur(s) en direct</span>
              </div>
              ${city.orderCount > 0 ? `<p style="margin: 6px 0 0; font-size: 11px; color: #334155;">Commandes : <strong>${city.orderCount}</strong></p>` : ''}
            </div>
          `)
        } else {
          const staticIcon = L.divIcon({
            className: 'osm-static-marker',
            html: `
              <div class="relative flex items-center justify-center cursor-pointer">
                <span class="h-3 w-3 rounded-full bg-amber-500 border border-white shadow-md"></span>
                <span class="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/80 text-white text-[9px] font-medium px-1.5 py-0.2 rounded shadow">
                  ${city.name}
                </span>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })

          const marker = L.marker([city.lat, city.lng], { icon: staticIcon }).addTo(map)
          marker.bindPopup(`
            <div style="font-family: inherit; padding: 2px;">
              <h4 style="margin: 0; font-size: 13px; font-weight: bold; color: #0f172a;">${city.name}</h4>
              <p style="margin: 2px 0 4px; font-size: 11px; color: #64748b;">Région du ${city.region}</p>
              <p style="margin: 4px 0 0; font-size: 11px; color: #334155;">Commandes : <strong>${city.orderCount}</strong></p>
            </div>
          `)
        }
      })

      mapInstanceRef.current = map
      setMapLoaded(true)
    }

    // Charger CSS Leaflet
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // Charger script Leaflet depuis CDN si absent
    if ((window as any).L) {
      initMap((window as any).L)
    } else {
      const existingScript = document.getElementById('leaflet-script') as HTMLScriptElement | null
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          if ((window as any).L) initMap((window as any).L)
        })
      } else {
        const script = document.createElement('script')
        script.id = 'leaflet-script'
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.async = true
        script.onload = () => {
          if ((window as any).L) initMap((window as any).L)
        }
        document.body.appendChild(script)
      }
    }

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
        } catch {}
        mapInstanceRef.current = null
      }
    }
  }, [liveSessions, cityCounts])

  const handleFlyToCity = (city: CityData) => {
    setSelectedCity(city.name)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([city.lat, city.lng], 10, { duration: 1.2 })
    }
  }

  const handleResetView = () => {
    setSelectedCity(null)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds([
        [1.5, 8.2],
        [13.2, 16.4],
      ], { padding: [10, 10], duration: 1 })
    }
  }

  const liveCities = cities.filter((c) => c.liveCount > 0)

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-2xs space-y-4">
      {/* En-tête de la carte */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span>Cartographie OpenStreetMap des Visiteurs & Commandes</span>
            </h2>
            <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/80 px-2 py-0.5 rounded-full">
              OpenStreetMap Cameroun
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Localisation en temps réel : les visiteurs en ligne apparaissent sous forme de <strong>points bleus pulsants</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetView}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Recentrer Cameroun</span>
          </button>
        </div>
      </div>

      {/* Villes actives en direct (Badges cliquables) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 shrink-0 font-medium text-[11px]">En direct :</span>
        {liveCities.length === 0 ? (
          <span className="text-slate-400 text-[11px] italic">Aucun visiteur connecté en ce moment.</span>
        ) : (
          liveCities.map((c) => (
            <button
              key={c.name}
              onClick={() => handleFlyToCity(c)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                selectedCity === c.name
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 hover:bg-blue-100'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
              <span>{c.name}</span>
              <span className="text-[10px] bg-white/30 dark:bg-black/30 px-1 rounded-full">
                {c.liveCount}
              </span>
            </button>
          ))
        )}

        <span className="text-slate-300 dark:text-slate-700 mx-1">|</span>
        <span className="text-slate-400 shrink-0 font-medium text-[11px]">Villes clés :</span>
        {['Douala', 'Yaoundé', 'Bafoussam', 'Garoua'].map((cityName) => {
          const c = cities.find((ci) => ci.name === cityName)
          if (!c) return null
          return (
            <button
              key={cityName}
              onClick={() => handleFlyToCity(c)}
              className="px-2 py-0.5 rounded text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200 shrink-0 transition-colors"
            >
              {cityName}
            </button>
          )
        })}
      </div>

      {/* Conteneur de la Carte Leaflet / OpenStreetMap */}
      <div className="relative w-full h-[360px] sm:h-[440px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Légende flottante en bas à gauche */}
        <div className="absolute bottom-3 left-3 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 p-2.5 rounded-lg shadow-md text-[11px] space-y-1.5 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Point Bleu : Visiteur en ligne (Direct)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-600 dark:text-slate-400">Point Jaune : Villes de commande historique</span>
          </div>
        </div>
      </div>
    </div>
  )
}
