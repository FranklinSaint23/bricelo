'use client'

import dynamic from 'next/dynamic'

const MapComponent = dynamic(
  () => import('./analytics-map').then((mod) => mod.AnalyticsMap),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2.5 text-slate-400">
          <div className="h-8 w-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <span className="text-xs font-medium">Chargement de la carte du Cameroun...</span>
        </div>
      </div>
    ),
  }
)

interface AnalyticsMapClientProps {
  liveSessions: Record<string, { timestamp: number; city?: string; path?: string; device?: string }>
  cityCounts: Record<string, number>
  totalOrders: number
}

export function AnalyticsMapClient(props: AnalyticsMapClientProps) {
  return <MapComponent {...props} />
}
