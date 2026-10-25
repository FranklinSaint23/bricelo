'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, RotateCcw, AlertTriangle } from 'lucide-react'

export function AnalyticsHeaderActions() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 600)
  }

  const handleReset = async () => {
    try {
      setIsResetting(true)
      const res = await fetch('/api/analytics/reset', { method: 'POST' })
      if (res.ok) {
        setShowConfirm(false)
        router.refresh()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
        title="Actualiser les statistiques"
      >
        <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span>Actualiser</span>
      </button>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/80 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200/60 dark:border-slate-700/60 rounded-lg transition-colors"
          title="Remettre les compteurs de visites et tests à zéro"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Remise à zéro des tests</span>
        </button>
      ) : (
        <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 rounded-lg px-2.5 py-1">
          <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span className="text-[11px] text-rose-700 dark:text-rose-300 font-medium">Confirmer le reset ?</span>
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="px-2 py-0.5 text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors"
          >
            {isResetting ? '...' : 'Oui, effacer'}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="px-1.5 py-0.5 text-[11px] text-slate-600 dark:text-slate-300 hover:underline"
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  )
}
