import { Loader2 } from 'lucide-react'

export default function ProductLoading() {
  return (
    <div className="min-h-[75vh] w-full flex items-center justify-center px-4 py-16 relative">
      {/* Halo lumineux d'ambiance doré */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="w-80 h-80 rounded-full bg-amber-400/15 dark:bg-amber-500/10 blur-3xl animate-pulse" />
      </div>

      {/* Carte effet verre dépoli avec grand spinner doré (aucun texte) */}
      <div className="relative z-10 flex items-center justify-center p-8 sm:p-10 rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 shadow-2xl shadow-amber-500/5 animate-in fade-in zoom-in-95 duration-200">
        <div className="relative flex items-center justify-center">
          {/* Grand anneau extérieur doré */}
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-amber-400/20 border-t-amber-500 border-r-amber-500 animate-spin" />
          
          {/* Spinner central */}
          <Loader2 className="absolute h-8 w-8 sm:h-10 sm:w-10 text-amber-500 animate-spin" />

          {/* Lueur subtile au cœur */}
          <div className="absolute h-6 w-6 rounded-full bg-amber-400/25 blur-xs pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
