'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/providers/language-provider'

const reviews = [
  { name: 'Kamga Bertrand', email: 'k.bertrand@gmail.com', rating: 5, product: 'Smartphone Samsung Galaxy A55', comment: 'Livraison ultra rapide, le produit est exactement comme décrit. Service client très réactif. Je recommande BRICELO à tous mes amis !' },
  { name: 'Tchoupo Sandrine', email: 's.tchoupo@yahoo.fr', rating: 5, product: 'Climatiseur MIDEA 1.5CV', comment: 'Excellent service ! La climatisation est arrivée bien emballée et fonctionne parfaitement. Le livreur était très sympa.' },
  { name: 'Nguele Patrick', email: 'nguele.p@gmail.com', rating: 4, product: 'Téléviseur LG 43 pouces', comment: 'Bonne expérience globale. Le TV est top, image magnifique. J\'aurais juste souhaité une livraison un peu plus rapide mais ça reste acceptable.' },
  { name: 'Biya Cécile', email: 'cecile.biya@hotmail.com', rating: 5, product: 'Robe de soirée élégante', comment: 'Wow ! La robe est encore plus belle en vrai qu\'en photo. La qualité est au rendez-vous et le prix est vraiment imbattable. Merci BRICELO !' },
  { name: 'Essama Daniel', email: 'd.essama@gmail.com', rating: 5, product: 'Réfrigérateur Samsung 300L', comment: 'Je suis vraiment satisfait de mon achat. Le frigo est parfait, silencieux et économique. La mise en place a été faite par les livreurs, chapeau !' },
  { name: 'Mbassi Lydie', email: 'lydie.mbassi@gmail.com', rating: 4, product: 'Set de casseroles inox', comment: 'Très bon rapport qualité-prix. Les casseroles sont solides et élégantes. Je suis contente de mon achat sur BRICELO.' },
  { name: 'Fouda Roméo', email: 'r.fouda@gmail.com', rating: 5, product: 'Chaussures Nike Air Max', comment: 'Authenticité garantie, j\'ai vérifié ! La paire est arrivée en 2 jours à Douala. BRICELO est fiable, je reviendrai pour mes prochains achats.' },
  { name: 'Ateba Christelle', email: 'c.ateba@outlook.com', rating: 5, product: 'iPhone 15 Pro Max', comment: 'Téléphone 100% original, livré en moins de 3 jours. Emballage parfait. Le service client a répondu à toutes mes questions rapidement. Top !' },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn('h-4 w-4', i < rating ? 'fill-[var(--color-accent)] text-[var(--color-accent)]' : 'text-slate-200 fill-slate-200')} />
      ))}
    </div>
  )
}

export function ReviewsBanner() {
  const { t } = useLanguage()
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setIdx(i => (i + 1) % reviews.length), [])
  const prev = useCallback(() => setIdx(i => (i - 1 + reviews.length) % reviews.length), [])

  useEffect(() => {
    if (paused) return
    const t = setInterval(next, 5500)
    return () => clearInterval(t)
  }, [paused, next])

  const r = reviews[idx]

  return (
    <section className="bg-[var(--color-navy-950)] py-12 px-4"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-[var(--color-accent)] text-xs font-bold uppercase tracking-widest mb-1">{t.testimonials}</p>
          <h2 className="text-xl font-bold text-white">{t.testimonialsSub}</h2>
        </div>

        <div className="relative">
          <div key={idx} className="slide-fade bg-white/5 border border-white/10 rounded-2xl px-6 py-8 sm:px-10">
            {/* Quote icon */}
            <Quote className="h-8 w-8 text-[var(--color-accent)]/40 mb-4" />

            {/* Stars */}
            <Stars rating={r.rating} />

            {/* Comment */}
            <p className="text-white/80 text-base leading-relaxed mt-4 italic">&ldquo;{r.comment}&rdquo;</p>

            {/* Product */}
            <p className="text-[var(--color-accent)]/70 text-xs font-medium mt-4">
              {t.reviewOn} <span className="text-[var(--color-accent)]">{r.product}</span>
            </p>

            {/* Reviewer */}
            <div className="flex items-center gap-3 mt-5 pt-5 border-t border-white/10">
              <Avatar name={r.name} size="md" />
              <div>
                <p className="text-white font-semibold text-sm">{r.name}</p>
                <p className="text-white/40 text-xs">{r.email}</p>
              </div>
            </div>
          </div>

          {/* Arrows */}
          <button onClick={prev}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={next}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          {reviews.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={cn('rounded-full transition-all duration-300', i === idx
                ? 'w-5 h-1.5 bg-[var(--color-accent)]'
                : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40')} />
          ))}
        </div>
      </div>
    </section>
  )
}
