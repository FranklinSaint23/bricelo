import Link from 'next/link'
import { Search, ArrowRight, ShieldCheck, Truck, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

const perks = [
  { icon: ShieldCheck, label: 'Paiement sécurisé', sub: 'Via CinetPay' },
  { icon: Truck,       label: 'Livraison rapide',  sub: 'Partout au Cameroun' },
  { icon: Star,        label: 'Vendeurs vérifiés',  sub: 'Qualité garantie' },
]

export function HeroSection() {
  return (
    <section className="relative bg-[var(--color-navy-900)] overflow-hidden">
      {/* Gradient décoratif */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[var(--color-accent)]/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-[var(--color-navy-700)]/50 blur-2xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="flex flex-col items-center text-center gap-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] text-xs font-semibold uppercase tracking-wider border border-[var(--color-accent)]/25">
            Marketplace N°1 au Cameroun
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight max-w-3xl">
            Tout ce dont vous avez besoin,{' '}
            <span className="text-[var(--color-accent)]">en un seul endroit</span>
          </h1>

          <p className="text-lg text-white/60 max-w-xl">
            Des milliers de produits, des centaines de vendeurs de confiance. Commandez facilement et soyez livré rapidement.
          </p>

          {/* Barre de recherche hero */}
          <form action="/recherche" method="get" className="w-full max-w-lg">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-slate-400)]" />
                <input
                  name="q"
                  type="search"
                  placeholder="Que recherchez-vous ?"
                  className="w-full h-13 pl-12 pr-4 rounded-[var(--radius-xl)] bg-white text-[var(--color-navy-900)] text-sm placeholder:text-[var(--color-slate-400)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] shadow-lg"
                />
              </div>
              <Button type="submit" size="lg" className="rounded-[var(--radius-xl)] shrink-0">
                Rechercher
              </Button>
            </div>
          </form>

          {/* CTA secondaire */}
          <Link href="/catalogue" className="flex items-center gap-1.5 text-sm text-white/60 hover:text-[var(--color-accent)] transition-colors mt-1">
            Parcourir le catalogue <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Perks bar */}
      <div className="relative border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 sm:divide-x sm:divide-white/10">
            {perks.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center justify-center gap-3 sm:px-6">
                <div className="h-9 w-9 rounded-full bg-[var(--color-accent)]/15 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-[var(--color-accent)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-white/50">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
