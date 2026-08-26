'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, ShoppingCart, Bell, User, Menu, X, ChevronDown,
  Phone, MessageCircle, Grid3X3, UserPlus,
  Truck, CreditCard, Store, RefreshCw, CheckCircle2,
  Sun, Moon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { CategoryIcon } from '@/components/ui/category-icon'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cart-store'
import { useTheme } from '@/components/providers/theme-provider'
import { useLanguage } from '@/components/providers/language-provider'

type NavUser = { full_name: string | null; avatar_url: string | null; role: string }

interface NavbarProps {
  user?: NavUser | null
  notifCount?: number
}

const TICKER_ICONS = [Truck, CreditCard, RefreshCw, Store, CheckCircle2]
const TICKER_COUNT = TICKER_ICONS.length

const categories = [
  {
    href: '/catalogue?categorie=telephones-tablettes', slug: 'telephones-tablettes', label: 'Téléphones & Tablettes',
    sub: [
      { label: 'Smartphones', href: '/catalogue?categorie=telephones-tablettes&type=smartphones' },
      { label: 'Tablettes', href: '/catalogue?categorie=telephones-tablettes&type=tablettes' },
      { label: 'Accessoires téléphones', href: '/catalogue?categorie=telephones-tablettes&type=accessoires' },
    ],
  },
  {
    href: '/catalogue?categorie=electromenager', slug: 'electromenager', label: 'Électroménager',
    sub: [
      { label: 'Réfrigérateurs & Congélateurs', href: '/catalogue?categorie=electromenager&type=refrigerateurs' },
      { label: 'Climatiseurs & Ventilateurs', href: '/catalogue?categorie=electromenager&type=climatiseurs' },
      { label: 'Machines à laver', href: '/catalogue?categorie=electromenager&type=machines-laver' },
      { label: 'Cuisinières & Fours', href: '/catalogue?categorie=electromenager&type=cuisinieres' },
    ],
  },
  {
    href: '/catalogue?categorie=electronique', slug: 'electronique', label: 'Électronique',
    sub: [
      { label: 'Ordinateurs & Laptops', href: '/catalogue?categorie=electronique&type=ordinateurs' },
      { label: 'Télévisions', href: '/catalogue?categorie=electronique&type=televisions' },
      { label: 'Audio & Son', href: '/catalogue?categorie=electronique&type=audio' },
      { label: 'Appareils photo & Vidéo', href: '/catalogue?categorie=electronique&type=photo' },
    ],
  },
  {
    href: '/catalogue?categorie=mode-vetements', slug: 'mode-vetements', label: 'Mode & Vêtements',
    sub: [
      { label: 'Vêtements Homme', href: '/catalogue?categorie=mode-vetements&type=homme' },
      { label: 'Vêtements Femme', href: '/catalogue?categorie=mode-vetements&type=femme' },
      { label: 'Chaussures', href: '/catalogue?categorie=mode-vetements&type=chaussures' },
      { label: 'Sacs & Maroquinerie', href: '/catalogue?categorie=mode-vetements&type=sacs' },
    ],
  },
  {
    href: '/catalogue?categorie=maison-jardin', slug: 'maison-jardin', label: 'Maison & Jardin',
    sub: [
      { label: 'Meubles & Literie', href: '/catalogue?categorie=maison-jardin&type=meubles' },
      { label: 'Décoration intérieure', href: '/catalogue?categorie=maison-jardin&type=decoration' },
      { label: 'Cuisine & Art de la table', href: '/catalogue?categorie=maison-jardin&type=cuisine' },
      { label: 'Jardinage & Outillage', href: '/catalogue?categorie=maison-jardin&type=jardinage' },
    ],
  },
  {
    href: '/catalogue?categorie=alimentation', slug: 'alimentation', label: 'Alimentation',
    sub: [
      { label: 'Épicerie & Condiments', href: '/catalogue?categorie=alimentation&type=epicerie' },
      { label: 'Boissons', href: '/catalogue?categorie=alimentation&type=boissons' },
      { label: 'Produits locaux camerounais', href: '/catalogue?categorie=alimentation&type=local' },
    ],
  },
  {
    href: '/catalogue?categorie=beaute-sante', slug: 'beaute-sante', label: 'Beauté & Santé',
    sub: [
      { label: 'Soins visage & corps', href: '/catalogue?categorie=beaute-sante&type=soins' },
      { label: 'Parfums & Fragrances', href: '/catalogue?categorie=beaute-sante&type=parfums' },
      { label: 'Santé & Bien-être', href: '/catalogue?categorie=beaute-sante&type=sante' },
      { label: 'Hygiène', href: '/catalogue?categorie=beaute-sante&type=hygiene' },
    ],
  },
]

export function Navbar({ user: initialUser, notifCount = 0 }: NavbarProps) {
  const router = useRouter()
  const cartCount = useCartStore((s) => s.itemCount())
  const { theme, toggle: toggleTheme } = useTheme()
  const { lang, t, toggle: toggleLang } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [authUser, setAuthUser]       = useState<NavUser | null>(initialUser ?? null)
  const [tickerIdx, setTickerIdx]     = useState(0)
  const [tickerKey, setTickerKey]     = useState(0)
  const [openCat, setOpenCat]         = useState<string | null>(null)
  const [mounted, setMounted]         = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const tickerItems = [
    { icon: TICKER_ICONS[0], text: t.ticker1 },
    { icon: TICKER_ICONS[1], text: t.ticker2 },
    { icon: TICKER_ICONS[2], text: t.ticker3 },
    { icon: TICKER_ICONS[3], text: t.ticker4 },
    { icon: TICKER_ICONS[4], text: t.ticker5 },
  ]

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data: profile } = await supabase
          .from('users').select('full_name, avatar_url, role').eq('id', user.id).single()
        setAuthUser(profile ?? {
          full_name: (user.user_metadata?.full_name as string | null) ?? user.email?.split('@')[0] ?? null,
          avatar_url: (user.user_metadata?.avatar_url as string | null) ?? null,
          role: 'customer',
        })
      } else {
        setAuthUser(null)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) setAuthUser(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  /* Ticker cycle */
  useEffect(() => {
    const t = setInterval(() => {
      setTickerIdx((i) => (i + 1) % 4)
      setTickerKey((k) => k + 1)
    }, 3500)
    return () => clearInterval(t)
  }, [])

  const user = authUser

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) router.push(`/recherche?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  return (
    <header className="sticky top-0 z-50 w-full">

      {/* ── 1. BARRE PROMO (Style Iziway) ── */}
      <div className="bg-[var(--color-navy-950)] h-9 overflow-hidden flex items-center border-b border-white/10">
        {/* Message animé en séquence */}
        <div className="flex-1 overflow-hidden px-3 sm:px-4 flex items-center">
          <div key={tickerKey} className="ticker-up flex items-center flex-wrap gap-2 text-xs whitespace-nowrap overflow-hidden text-ellipsis">
            {tickerIdx === 0 && (
              <>
                <span className="text-[var(--color-accent)] font-black tracking-wider uppercase text-xs sm:text-sm">BRICELO ...</span>
                <span className="text-white font-bold hidden sm:inline text-xs sm:text-sm">VOS ESSENTIELS À PETIT PRIX ...</span>
                <span className="text-[var(--color-navy-950)] font-black bg-[var(--color-accent)] px-2 py-0.5 rounded text-[11px] sm:text-xs shadow-xs animate-pulse">
                  Jusqu'à -70%
                </span>
              </>
            )}
            {tickerIdx === 1 && (
              <>
                <span className="text-[var(--color-accent)] font-black tracking-wider uppercase text-xs sm:text-sm">LIVRAISON EXPRESS ...</span>
                <span className="text-white font-bold hidden sm:inline text-xs sm:text-sm">1 000 FCFA SEULEMENT ...</span>
                <span className="text-amber-300 font-extrabold bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 rounded text-[11px] sm:text-xs">
                  Paiement à la livraison
                </span>
              </>
            )}
            {tickerIdx === 2 && (
              <>
                <span className="text-[var(--color-accent)] font-black tracking-wider uppercase text-xs sm:text-sm">SERVICE CLIENT 7J/7 ...</span>
                <span className="text-white font-bold hidden sm:inline text-xs sm:text-sm">Assistance & Commandes WhatsApp ...</span>
                <span className="text-amber-300 font-extrabold bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 rounded text-[11px] sm:text-xs">
                  +237 6 52 70 42 18
                </span>
              </>
            )}
            {tickerIdx === 3 && (
              <>
                <span className="text-[var(--color-accent)] font-black tracking-wider uppercase text-xs sm:text-sm">BOUTIQUES CERTIFIÉES ...</span>
                <span className="text-white font-bold hidden sm:inline text-xs sm:text-sm">Des milliers de produits au Cameroun ...</span>
                <span className="text-emerald-300 font-extrabold bg-emerald-400/20 border border-emerald-400/30 px-2 py-0.5 rounded text-[11px] sm:text-xs">
                  100% Vérifiés
                </span>
              </>
            )}
          </div>
        </div>

        {/* Contact & Support client (Style Iziway) */}
        <div className="flex items-center gap-2.5 px-3 sm:px-4 shrink-0 border-l border-white/15 h-full bg-white/[0.04]">
          <div className="flex items-center gap-1.5">
            <a
              href="https://wa.me/237652704218"
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp Service Client (+237 6 52 70 42 18)"
              className="h-6 w-6 rounded-full bg-[var(--color-accent)] hover:bg-amber-400 text-[var(--color-navy-950)] flex items-center justify-center transition-transform hover:scale-110 shadow-xs"
            >
              <MessageCircle className="h-3.5 w-3.5 fill-current" />
            </a>
            <a
              href="tel:+237652704218"
              title="Appeler le Service Client (+237 6 52 70 42 18)"
              className="h-6 w-6 rounded-full bg-[var(--color-accent)] hover:bg-amber-400 text-[var(--color-navy-950)] flex items-center justify-center transition-transform hover:scale-110 shadow-xs"
            >
              <Phone className="h-3.5 w-3.5 fill-current" />
            </a>
          </div>
          <div className="hidden sm:flex flex-col justify-center text-[10px] leading-tight">
            <span className="text-white/60 font-medium">Service client</span>
            <a href="tel:+237652704218" className="text-[var(--color-accent)] font-extrabold text-xs hover:underline tracking-tight">
              6 52 70 42 18
            </a>
          </div>
        </div>
      </div>

      {/* ── 2. BARRE PRINCIPALE ── */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-slate-200)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 lg:gap-5 py-2.5">

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <span className="text-[var(--color-navy-900)] font-extrabold text-2xl sm:text-2xl tracking-tight leading-none">
              BRICE<span className="text-[var(--color-accent)]">LO</span>
              <span className="text-[var(--color-slate-400)] font-light text-base">.com</span>
            </span>
          </Link>

          {/* Recherche desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1">
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="flex-1 h-10 px-4 text-sm border border-[var(--color-slate-300)] border-r-0 rounded-l-md focus:outline-none focus:border-[var(--color-navy-900)] text-[var(--color-navy-900)] placeholder:text-[var(--color-slate-400)]"
            />
            <button type="submit"
              className="h-10 px-5 bg-[var(--color-navy-900)] hover:bg-[var(--color-navy-950)] text-white font-bold text-xs rounded-r-md transition-colors shrink-0 tracking-wide">
              {t.searchBtn}
            </button>
          </form>

          {/* Actions droite */}
          <div className="ml-auto flex items-center gap-1">

            {/* Auth desktop */}
            {user ? (
              <div className="relative group hidden md:block">
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--color-slate-100)] transition-colors">
                  <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
                  <div className="hidden lg:block text-left">
                    <p className="text-[10px] text-[var(--color-slate-400)] leading-none">{t.myAccount}</p>
                    <p className="text-xs font-semibold text-[var(--color-navy-900)] max-w-[90px] truncate">{user.full_name ?? t.myAccount}</p>
                  </div>
                  <ChevronDown className="h-3 w-3 text-[var(--color-slate-400)] hidden lg:block" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-lg border border-[var(--color-slate-200)] py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                  <div className="px-4 py-2.5 border-b border-[var(--color-slate-100)]">
                    <p className="text-sm font-semibold text-[var(--color-navy-900)] truncate">{user.full_name ?? t.myAccount}</p>
                  </div>
                  <Link href="/profil"    className="flex px-4 py-2 text-sm text-[var(--color-slate-700)] hover:bg-[var(--color-slate-50)]">{t.myProfile}</Link>
                  <Link href="/commandes" className="flex px-4 py-2 text-sm text-[var(--color-slate-700)] hover:bg-[var(--color-slate-50)]">{t.myOrders}</Link>
                  {(user.role === 'vendor' || user.role === 'admin') && (
                    <Link href="/vendeur" className="flex px-4 py-2 text-sm text-[var(--color-slate-700)] hover:bg-[var(--color-slate-50)]">{t.vendorSpace}</Link>
                  )}
                  {user.role === 'admin' && (
                    <Link href="/admin" className="flex px-4 py-2 text-sm text-[var(--color-slate-700)] hover:bg-[var(--color-slate-50)]">{t.administration}</Link>
                  )}
                  <hr className="my-1 border-[var(--color-slate-100)]" />
                  <form action="/api/auth/signout" method="post">
                    <button className="w-full text-left px-4 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-slate-50)]">{t.logout}</button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login"
                  className="h-9 px-3 text-xs font-semibold rounded-md inline-flex items-center gap-1.5 border border-[var(--color-slate-300)] text-[var(--color-navy-900)] hover:bg-[var(--color-slate-50)] transition-colors">
                  <User className="h-3.5 w-3.5" /> {t.login}
                </Link>
                <Link href="/register"
                  className="h-9 px-3 text-xs font-bold rounded-md inline-flex items-center bg-[var(--color-accent)] hover:bg-[var(--color-gold-600)] text-[var(--color-navy-900)] transition-colors">
                  {t.register}
                </Link>
              </div>
            )}

            {/* Notifications desktop */}
            {user && (
              <Link href="/notifications" aria-label="Notifications"
                className="relative p-2 hidden md:flex text-[var(--color-slate-500)] hover:text-[var(--color-navy-900)] hover:bg-[var(--color-slate-100)] rounded-md transition-colors">
                <Bell className="h-5 w-5" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[var(--color-danger)] text-[10px] font-bold text-white flex items-center justify-center">
                    {notifCount}
                  </span>
                )}
              </Link>
            )}

            {/* Langue — desktop */}
            <button
              onClick={toggleLang}
              aria-label="Changer de langue"
              className="hidden md:flex items-center gap-1 h-9 px-2.5 rounded-md border border-[var(--color-slate-300)] hover:bg-[var(--color-slate-100)] transition-colors text-xs font-bold text-[var(--color-navy-900)]"
            >
              <span className="text-sm leading-none">{lang === 'fr' ? '🇬🇧' : '🇫🇷'}</span>
              <span>{lang === 'fr' ? 'EN' : 'FR'}</span>
            </button>

            {/* Thème — desktop */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? t.lightMode : t.darkMode}
              className="hidden md:flex p-2 text-[var(--color-slate-500)] hover:text-[var(--color-navy-900)] hover:bg-[var(--color-slate-100)] rounded-md transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Langue — mobile (juste avant le panier) */}
            <button
              onClick={toggleLang}
              aria-label="Changer de langue"
              className="flex md:hidden p-2 rounded-md hover:bg-[var(--color-slate-100)] transition-colors text-xl leading-none"
            >
              {lang === 'fr' ? '🇬🇧' : '🇫🇷'}
            </button>

            {/* Panier */}
            <Link href="/panier" aria-label="Panier"
              className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-[var(--color-slate-100)] transition-colors">
              <div className="relative">
                <ShoppingCart className="h-6 w-6 text-[var(--color-navy-900)]" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-[var(--color-navy-900)] flex items-center justify-center shadow-sm">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:block text-xs font-semibold text-[var(--color-navy-900)]">{t.cart}</span>
            </Link>

            {!user && (
              <Link href="/register" aria-label="Créer un compte"
                className="flex md:hidden p-2 text-[var(--color-slate-500)] hover:text-[var(--color-navy-900)] hover:bg-[var(--color-slate-100)] rounded-md transition-colors">
                <UserPlus className="h-6 w-6" />
              </Link>
            )}

            {/* Burger mobile */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="flex md:hidden p-2 text-[var(--color-navy-900)] hover:bg-[var(--color-slate-100)] rounded-md transition-colors"
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {mobileOpen ? <X className="h-6.5 w-6.5" /> : <Menu className="h-6.5 w-6.5" />}
            </button>
          </div>
          </div>{/* fin flex row */}

          {/* Barre de recherche mobile — sous le logo */}
          <div className="md:hidden pb-2.5">
            <form onSubmit={e => { handleSearch(e) }} className="flex">
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t.searchMobile}
                className="flex-1 h-10 px-3 text-sm border border-[var(--color-slate-300)] border-r-0 rounded-l-md focus:outline-none focus:border-[var(--color-navy-900)] text-[var(--color-navy-900)] placeholder:text-[var(--color-slate-400)]"
              />
              <button type="submit"
                className="h-10 px-4 bg-[var(--color-navy-900)] text-white rounded-r-md shrink-0 flex items-center justify-center hover:bg-[var(--color-navy-950)] transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── 3. BARRE CATÉGORIES — desktop uniquement ── */}
      <div className="hidden md:block bg-[var(--color-navy-900)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-stretch">
          <Link href="/catalogue"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-navy-950)] text-white text-xs font-bold shrink-0 hover:bg-black/40 transition-colors">
            <Grid3X3 className="h-3.5 w-3.5" />
            <span>{t.allCategories}</span>
          </Link>
          <div className="w-px bg-white/10 shrink-0" />
          <nav className="flex items-center overflow-x-auto scrollbar-hide">
            {categories.map(({ href, slug, label }) => (
              <Link key={href} href={href}
                className="flex items-center gap-1.5 px-3 py-2 text-[var(--color-accent)] text-[11px] font-bold whitespace-nowrap hover:bg-white/10 transition-colors shrink-0">
                <CategoryIcon slug={slug} size="xs" className="rounded-md shadow-none" />
                {label.toUpperCase()}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* ── MENU MOBILE SLIDE-OVER DRAWER (3/4 de l'écran avec fond sombre & Connexion en haut) ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex justify-end">
          {/* Backdrop sombre au clic pour fermer */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Tiroir latéral (78% de la largeur sur mobile: w-[78%] max-w-xs) */}
          <div className="relative w-[78%] max-w-xs h-full bg-[var(--color-surface)] shadow-2xl flex flex-col z-50 overflow-y-auto">
            {/* Header du Tiroir avec logo et bouton fermer */}
            <div className="p-4 border-b border-[var(--color-slate-100)] flex items-center justify-between bg-[var(--color-slate-50)]">
              <span className="font-extrabold text-base tracking-tight text-[var(--color-navy-900)]">
                BRICE<span className="text-[var(--color-accent)]">LO</span>
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-[var(--color-slate-500)] hover:bg-[var(--color-slate-200)] transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 1. CONNEXION / INSCRIPTION OU COMPTE EN HAUT DU MENU */}
            <div className="p-4 border-b border-[var(--color-slate-100)] bg-amber-500/5">
              {!user ? (
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold text-[var(--color-slate-400)] uppercase tracking-widest">
                    Mon Compte
                  </p>
                  <div className="flex gap-2">
                    <Link href="/login" onClick={() => setMobileOpen(false)}
                      className="flex-1 h-9 text-xs font-bold rounded-lg flex items-center justify-center border border-[var(--color-slate-300)] bg-white text-[var(--color-navy-900)] shadow-2xs">
                      {t.login}
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}
                      className="flex-1 h-9 text-xs font-bold rounded-lg flex items-center justify-center bg-[var(--color-accent)] text-[var(--color-navy-900)] shadow-2xs">
                      {t.register}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 pb-2 mb-2 border-b border-slate-200/60">
                    <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[var(--color-navy-900)] truncate">{user.full_name}</p>
                      <p className="text-[10px] text-[var(--color-slate-400)] capitalize">{user.role}</p>
                    </div>
                  </div>
                  {[
                    { href: '/profil', label: t.myProfile },
                    { href: '/commandes', label: t.myOrders },
                    ...(user.role === 'vendor' || user.role === 'admin' ? [{ href: '/vendeur', label: t.vendorSpace }] : []),
                    ...(user.role === 'admin' ? [{ href: '/admin', label: t.administration }] : []),
                  ].map(item => (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                      className="px-2 py-2 text-xs font-medium text-[var(--color-slate-700)] hover:bg-white rounded-md transition-colors">
                      {item.label}
                    </Link>
                  ))}
                  <form action="/api/auth/signout" method="post" className="mt-1">
                    <button className="w-full text-left px-2 py-1.5 text-xs font-bold text-[var(--color-danger)] hover:bg-white rounded-md">
                      {t.logout}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* 2. CATÉGORIES EN DESSOUS */}
            <div className="flex-1 py-2">
              <p className="px-4 pt-2 pb-1 text-[10px] font-bold text-[var(--color-slate-400)] uppercase tracking-widest">
                {t.allCategories}
              </p>
              {categories.map(({ href, slug, label, sub }) => (
                <div key={href}>
                  <button
                    onClick={() => setOpenCat(openCat === href ? null : href)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-[var(--color-slate-50)] transition-colors border-t border-[var(--color-slate-100)]"
                  >
                    <CategoryIcon slug={slug} size="xs" />
                    <span className="flex-1 text-xs font-semibold text-[var(--color-navy-900)]">{label}</span>
                    <ChevronDown className={cn(
                      'h-3.5 w-3.5 text-[var(--color-slate-400)] transition-transform duration-200 shrink-0',
                      openCat === href && 'rotate-180'
                    )} />
                  </button>
                  {openCat === href && (
                    <div className="bg-[var(--color-slate-50)] border-t border-[var(--color-slate-100)]">
                      <Link href={href} onClick={() => { setMobileOpen(false); setOpenCat(null) }}
                        className="flex items-center gap-2 pl-11 pr-4 py-2 text-xs font-bold text-[var(--color-navy-900)] hover:bg-[var(--color-slate-100)] transition-colors">
                        Tout - {label}
                      </Link>
                      {sub.map(s => (
                        <Link key={s.href} href={s.href} onClick={() => { setMobileOpen(false); setOpenCat(null) }}
                          className="flex items-center pl-11 pr-4 py-2 text-xs text-[var(--color-slate-600)] hover:bg-[var(--color-slate-100)] hover:text-[var(--color-navy-900)] transition-colors border-t border-[var(--color-slate-100)]">
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link href="/catalogue" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 border-t border-[var(--color-slate-100)] hover:bg-[var(--color-slate-50)] transition-colors">
                <div className="h-8 w-8 rounded-lg bg-[var(--color-navy-900)] flex items-center justify-center shrink-0">
                  <Grid3X3 className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="flex-1 text-xs font-bold text-[var(--color-navy-900)]">{t.allCatalog}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
