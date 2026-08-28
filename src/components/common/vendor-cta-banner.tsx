'use client'

import Link from 'next/link'
import { GraduationCap, Store, ArrowRight, PlayCircle } from 'lucide-react'

export function VendorCtaBanner() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 my-8">
      <div className="rounded-2xl bg-[var(--color-navy-900)] p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl border border-white/10 relative overflow-hidden">
        {/* Motif décoratif en arrière plan */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-4 max-w-2xl relative z-10">
          <div className="h-12 w-12 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0 mt-1 shadow-inner">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold text-[11px] uppercase tracking-wider mb-2 border border-amber-400/30">
              Académie E-Commerce BRICÉLO
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
              Devenez Vendeur & Développez vos Ventes en Ligne
            </h3>
            <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
              Ouvrez votre boutique officielle ou accédez à nos tutoriels vidéo gratuits pour apprendre les bases du commerce électronique (créer sa boutique, publier ses produits, encaisser l’argent et réussir ses ventes).
            </p>
          </div>
        </div>

        {/* Boutons d'actions côte à côte */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto relative z-10 shrink-0">
          <Link
            href="/devenir-vendeur"
            className="h-12 px-6 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <Store className="h-4 w-4" />
            <span>Ouvrir une boutique</span>
          </Link>

          <Link
            href="/apprendre-a-vendre"
            className="h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <PlayCircle className="h-4 w-4 text-amber-400" />
            <span>Apprendre à vendre en ligne</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
