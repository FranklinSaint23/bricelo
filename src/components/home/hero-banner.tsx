'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, ChevronRight,
  Smartphone, Zap, ShoppingBag, Laptop, ShoppingCart, Store, Plug, Gamepad2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/providers/language-provider'
import type { Translations } from '@/lib/i18n/translations'

/* ── CONFIG STATIQUE (photos, couleurs, icônes) ────────────────────────── */
const slideConfigs = [
  { id:1, photo:'https://images.unsplash.com/photo-1603145733146-ae562a55031e?w=1400&q=85&auto=format&fit=crop', bgColor:'#0a0e17', photoPos:'65% center', overlay:'linear-gradient(105deg, rgba(8,10,18,0.97) 38%, rgba(8,10,18,0.12) 78%)', accent:'#FFC107', BadgeIcon:Smartphone, badgeText:'TECH & MOBILE', href:'/catalogue?categorie=telephones-tablettes', textKey:'1' as const },
  { id:2, photo:'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=85&auto=format&fit=crop', bgColor:'#1a0505', photoPos:'65% center', overlay:'linear-gradient(105deg, rgba(90,5,5,0.97) 38%, rgba(90,5,5,0.12) 78%)', accent:'#FFD700', BadgeIcon:Zap, badgeText:'FLASH SALE', href:'/catalogue', textKey:'2' as const },
  { id:3, photo:'https://images.unsplash.com/photo-1768212565424-efa3a3852b81?w=1400&q=85&auto=format&fit=crop', bgColor:'#0a1a12', photoPos:'center center', overlay:'linear-gradient(105deg, rgba(0,40,20,0.97) 38%, rgba(0,40,20,0.10) 78%)', accent:'#A5D6A7', BadgeIcon:ShoppingBag, badgeText:'NEW COLLECTION', href:'/catalogue?categorie=mode-vetements', textKey:'3' as const },
  { id:4, photo:'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1400&q=85&auto=format&fit=crop', bgColor:'#050e1a', photoPos:'65% center', overlay:'linear-gradient(105deg, rgba(5,14,40,0.97) 38%, rgba(5,14,40,0.12) 78%)', accent:'#90CAF9', BadgeIcon:Laptop, badgeText:'HIGH-TECH', href:'/catalogue?categorie=electronique', textKey:'4' as const },
  { id:5, photo:'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1400&q=85&auto=format&fit=crop', bgColor:'#0f1a06', photoPos:'60% center', overlay:'linear-gradient(105deg, rgba(15,30,5,0.97) 38%, rgba(15,30,5,0.10) 78%)', accent:'#C8E6C9', BadgeIcon:ShoppingCart, badgeText:'FOOD', href:'/catalogue?categorie=alimentation', textKey:'5' as const },
  { id:6, photo:'https://images.unsplash.com/photo-1772411535291-aa5884035934?w=1400&q=85&auto=format&fit=crop', bgColor:'#0d0a1f', photoPos:'center center', overlay:'linear-gradient(105deg, rgba(20,10,60,0.97) 38%, rgba(20,10,60,0.12) 78%)', accent:'#CE93D8', BadgeIcon:Store, badgeText:'SELLERS', href:'/devenir-vendeur', textKey:'6' as const },
]

type SlideText = { headline: string; sub: string; extra: string; ctaLabel: string }
type SlideTextFn = (t: Translations, lang: string) => SlideText

const slideTexts: Record<string, SlideTextFn> = {
  '1': (t) => ({ headline: t.heroSlide1Headline, sub: t.heroSlide1Sub, extra: t.heroSlide1Extra, ctaLabel: t.heroSlide1Cta }),
  '2': (_t, lang) => ({ headline: "Jusqu'à –70%", sub: lang === 'fr' ? 'Sur une sélection de produits.' : 'On selected products.', extra: lang === 'fr' ? "Offres valables jusqu'à épuisement des stocks." : 'While stocks last.', ctaLabel: lang === 'fr' ? 'EN PROFITER MAINTENANT' : 'SHOP NOW' }),
  '3': (t, lang) => ({ headline: t.heroSlide3Headline, sub: lang === 'fr' ? 'Bogolan, Ankara & prêt-à-porter élégant.' : 'Bogolan, Ankara & elegant ready-to-wear.', extra: lang === 'fr' ? 'Livraison express à Douala & Yaoundé.' : 'Express delivery to Douala & Yaoundé.', ctaLabel: t.heroSlide3Cta }),
  '4': (_t, lang) => ({ headline: lang === 'fr' ? 'Électronique & Informatique' : 'Electronics & Computing', sub: lang === 'fr' ? 'PC portables, TV, Audio, Accessoires.' : 'Laptops, TVs, Audio, Accessories.', extra: lang === 'fr' ? 'Garantie constructeur sur tous les produits.' : 'Manufacturer warranty on all products.', ctaLabel: lang === 'fr' ? "DÉCOUVRIR L'ÉLECTRONIQUE" : 'SHOP ELECTRONICS' }),
  '5': (t, lang) => ({ headline: lang === 'fr' ? 'Produits du Terroir' : 'Local Farm Products', sub: lang === 'fr' ? 'Épices, huile de palme, miel naturel & plus.' : 'Spices, palm oil, natural honey & more.', extra: lang === 'fr' ? 'Directement des producteurs locaux.' : 'Directly from local producers.', ctaLabel: t.heroSlide4Cta }),
  '6': (t, lang) => ({ headline: lang === 'fr' ? 'Ouvrez Votre Boutique' : 'Open Your Store', sub: lang === 'fr' ? 'Vendez en ligne simplement et gratuitement.' : 'Sell online easily and for free.', extra: lang === 'fr' ? 'Zéro commission cachée. Support 7j/7.' : 'Zero hidden fees. 7/7 support.', ctaLabel: t.heroSlide6Cta }),
}

const sideBannerConfigs = [
  { id:1, photo:'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=700&q=85&auto=format&fit=crop', overlay:'linear-gradient(160deg, rgba(120,5,5,0.88) 0%, rgba(60,2,2,0.70) 100%)', Icon:Plug, href:'/catalogue?categorie=electromenager', badge:'DU 08 AU 22 AOÛT' },
  { id:2, photo:'https://images.unsplash.com/photo-1603145733146-ae562a55031e?w=1400&q=85&auto=format&fit=crop', overlay:'linear-gradient(160deg, rgba(20,10,90,0.88) 0%, rgba(60,20,120,0.72) 100%)', Icon:Gamepad2, href:'/catalogue?categorie=electronique', badge: null },
]

/* ── COMPOSANT ───────────────────────────────────────────────────────────── */

export function HeroBanner() {
  const { t, lang } = useLanguage()
  const [current,  setCurrent]  = useState(0)
  const [slideKey, setSlideKey] = useState(0)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null)

  const slideCount = slideConfigs.length
  const goNext = useCallback(() => {
    setCurrent((c) => (c + 1) % slideCount)
    setSlideKey((k) => k + 1)
  }, [slideCount])

  const goPrev = useCallback(() => {
    setCurrent((c) => (c - 1 + slideCount) % slideCount)
    setSlideKey((k) => k + 1)
  }, [slideCount])

  const goTo = useCallback((i: number) => {
    setCurrent(i)
    setSlideKey((k) => k + 1)
  }, [])

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(goNext, 5500)
  }

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [goNext])

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = touchStartX.current - e.changedTouches[0].clientX
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY)
    if (Math.abs(dx) > 40 && Math.abs(dx) > dy) {
      dx > 0 ? goNext() : goPrev()
      resetTimer()
    }
  }

  const slides = slideConfigs.map((cfg) => {
    const texts = slideTexts[cfg.textKey](t, lang)
    return { ...cfg, headline: texts.headline, sub: texts.sub, extra: texts.extra, cta: { label: texts.ctaLabel, href: cfg.href } }
  })

  const sideBanners = [
    { ...sideBannerConfigs[0], title: lang === 'fr' ? 'ÉLECTROCHOC' : 'POWER DEALS', sub: lang === 'fr' ? 'DÉCOUVREZ NOTRE SÉLECTION' : 'DISCOVER OUR SELECTION' },
    { ...sideBannerConfigs[1], title: 'GAMING ZONE', sub: lang === 'fr' ? 'CONSOLES & ACCESSOIRES' : 'CONSOLES & ACCESSORIES' },
  ]

  const slide = slides[current]

  return (
    <section className="bg-[var(--color-slate-100)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-3 pb-3">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_288px] xl:grid-cols-[1fr_308px] gap-3">

          {/* ── CARROUSEL ── */}
          <div
            className="relative rounded-2xl overflow-hidden select-none"
            style={{ minHeight: 320, background: slide.bgColor }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* Photo de fond + overlay */}
            <div
              key={slideKey}
              className="hero-slide-in absolute inset-0"
              style={{
                backgroundImage: `${slide.overlay}, url("${slide.photo}")`,
                backgroundSize: 'cover',
                backgroundPosition: slide.photoPos,
              }}
            >
              {/* Contenu texte */}
              <div className="relative z-10 h-full flex flex-col justify-center px-7 sm:px-14 py-10 max-w-[60%] sm:max-w-[55%]">

                {/* Badge */}
                <span
                  className="inline-flex items-center gap-1.5 w-fit text-[10px] sm:text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full mb-5 border"
                  style={{ color: slide.accent, borderColor: slide.accent + '55', background: slide.accent + '18' }}
                >
                  <slide.BadgeIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />
                  {slide.badgeText}
                </span>

                {/* Titre */}
                <h2
                  className="text-2xl sm:text-4xl font-black leading-tight mb-3"
                  style={{ color: slide.accent }}
                >
                  {slide.headline}
                </h2>

                {/* Sous-titres */}
                <p className="text-white font-semibold text-sm sm:text-lg leading-snug mb-1">
                  {slide.sub}
                </p>
                <p className="text-white/55 text-xs sm:text-sm mb-7">
                  {slide.extra}
                </p>

                {/* CTA */}
                <Link
                  href={slide.cta.href}
                  className="inline-flex items-center gap-2 w-fit px-5 py-2.5 rounded-lg text-xs sm:text-sm font-black tracking-wide transition-all hover:opacity-85 active:scale-95 hover:gap-3"
                  style={{ background: slide.accent, color: '#111' }}
                >
                  {slide.cta.label} &rsaquo;
                </Link>
              </div>

              {/* Dots */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => { goTo(i); resetTimer() }}
                    aria-label={`Slide ${i + 1}`}
                    className={cn(
                      'rounded-full transition-all duration-300',
                      i === current ? 'w-6 h-2' : 'w-2 h-2 bg-white/35 hover:bg-white/65'
                    )}
                    style={i === current ? { background: slide.accent } : {}}
                  />
                ))}
              </div>
            </div>

            {/* Flèches desktop */}
            <button
              onClick={() => { goPrev(); resetTimer() }}
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm items-center justify-center text-white/70 hover:bg-black/50 hover:text-white transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => { goNext(); resetTimer() }}
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm items-center justify-center text-white/70 hover:bg-black/50 hover:text-white transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* ── BANNIÈRES LATÉRALES ── */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {sideBanners.map((b) => (
              <Link
                key={b.id}
                href={b.href}
                className="relative rounded-2xl overflow-hidden flex flex-col justify-end p-4 sm:p-5 transition-transform hover:scale-[1.015] active:scale-[0.98] cursor-pointer"
                style={{
                  minHeight: 148,
                  backgroundImage: `${b.overlay}, url("${b.photo}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="relative z-10">
                  <p className="text-white/65 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase mb-0.5">
                    {b.sub}
                  </p>
                  <h3 className="text-white font-black text-base sm:text-xl leading-tight flex items-center gap-2">
                    <b.Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
                    {b.title}
                  </h3>
                  {b.badge && (
                    <p className="text-yellow-300 text-[10px] sm:text-xs font-bold mt-1">{b.badge}</p>
                  )}
                  <p className="text-white/70 text-xs font-bold tracking-wide mt-2">
                    {lang === 'fr' ? 'DÉCOUVRIR' : 'EXPLORE'} &rsaquo;
                  </p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
