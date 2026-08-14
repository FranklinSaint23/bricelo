'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, ShoppingCart, Bell, User, Menu, X, ChevronDown,
  Phone, MessageCircle, Grid3X3, HelpCircle, UserPlus,
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
      setTickerIdx(i => (i + 1) % TICKER_COUNT)
      setTickerKey(k => k + 1)
    }, 3000)
    return () => clearInterval(t)
  }, [])

  const user = authUser
  const ticker = tickerItems[tickerIdx]
  const TickerIcon = ticker.icon

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) router.push(`/recherche?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  return (
    <header className="sticky top-0 z-50 w-full">

      {/* ── 1. BARRE PROMO ── */}
      <div className="bg-[var(--color-navy-950)] h-8 overflow-hidden flex items-center">
        {/* Message animé */}
        <div className="flex-1 overflow-hidden px-4 flex items-center">
          <span key={tickerKey} className="ticker-up text-[11px] text-white/80 font-medium whitespace-nowrap overflow-hidden text-ellipsis block">
            <TickerIcon className="inline h-3.5 w-3.5 text-[var(--color-accent)] mr-2" />
            {ticker.text}
          </span>
        </div>
        {/* Contact — desktop seulement */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-white/55 px-4 shrink-0 border-l border-white/10 h-full">
          <a href="tel:+237000000000" className="flex items-center gap-1 hover:text-[var(--color-accent)] transition-colors whitespace-nowrap">
            <Phone className="h-3 w-3" /> +237 000 000 000
          </a>
          <span className="text-white/20">|</span>
          <a href="/contact" className="flex items-center gap-1 hover:text-[var(--color-accent)] transition-colors whitespace-nowrap">
            <MessageCircle className="h-3 w-3" /> {t.help}
          </a>
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
              className="flex md:hidden p-2 rounded-md hover:bg-[var(--color-slate-100)] transition-colors text-base leading-none"
            >
              {lang === 'fr' ? '🇬🇧' : '🇫🇷'}
            </button>

            {/* Panier */}
            <Link href="/panier" aria-label="Panier"
              className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-[var(--color-slate-100)] transition-colors">
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-[var(--color-navy-900)]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-[var(--color-navy-900)] flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:block text-xs font-semibold text-[var(--color-navy-900)]">{t.cart}</span>
            </Link>

            {/* Mobile: Aide */}
            <a href="/contact" aria-label="Aide"
              className="flex md:hidden p-2 text-[var(--color-slate-500)] hover:text-[var(--color-navy-900)] hover:bg-[var(--color-slate-100)] rounded-md transition-colors">
              <HelpCircle className="h-5 w-5" />
            </a>

            {/* Thème — mobile */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? t.lightMode : t.darkMode}
              className="flex md:hidden p-2 text-[var(--color-slate-500)] hover:text-[var(--color-navy-900)] hover:bg-[var(--color-slate-100)] rounded-md transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {!user && (
              <Link href="/register" aria-label="Créer un compte"
                className="flex md:hidden p-2 text-[var(--color-slate-500)] hover:text-[var(--color-navy-900)] hover:bg-[var(--color-slate-100)] rounded-md transition-colors">
                <UserPlus className="h-5 w-5" />
              </Link>
            )}

            {/* Burger mobile */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="flex md:hidden p-2 text-[var(--color-navy-900)] hover:bg-[var(--color-slate-100)] rounded-md transition-colors"
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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

      {/* ── MENU MOBILE ── */}
      {mobileOpen && (
        <div className="md:hidden bg-[var(--color-surface)] border-t border-[var(--color-slate-200)] shadow-xl max-h-[calc(100dvh-112px)] overflow-y-auto">

          {/* Catégories verticales avec accordéon */}
          <div className="border-b border-[var(--color-slate-100)]">
            <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-[var(--color-slate-400)] uppercase tracking-widest">
              {t.allCategories}
            </p>
            {categories.map(({ href, slug, label, sub }) => (
              <div key={href}>
                <button
                  onClick={() => setOpenCat(openCat === href ? null : href)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-slate-50)] transition-colors border-t border-[var(--color-slate-100)]"
                >
                  <CategoryIcon slug={slug} size="sm" />
                  <span className="flex-1 text-sm font-semibold text-[var(--color-navy-900)]">{label}</span>
                  <ChevronDown className={cn(
                    'h-4 w-4 text-[var(--color-slate-400)] transition-transform duration-200 shrink-0',
                    openCat === href && 'rotate-180'
                  )} />
                </button>
                {openCat === href && (
                  <div className="bg-[var(--color-slate-50)] border-t border-[var(--color-slate-100)]">
                    <Link href={href} onClick={() => { setMobileOpen(false); setOpenCat(null) }}
                      className="flex items-center gap-2 pl-14 pr-4 py-2.5 text-sm font-bold text-[var(--color-navy-900)] hover:bg-[var(--color-slate-100)] transition-colors">
                      Tout — {label}
                    </Link>
                    {sub.map(s => (
                      <Link key={s.href} href={s.href} onClick={() => { setMobileOpen(false); setOpenCat(null) }}
                        className="flex items-center pl-14 pr-4 py-2.5 text-sm text-[var(--color-slate-600)] hover:bg-[var(--color-slate-100)] hover:text-[var(--color-navy-900)] transition-colors border-t border-[var(--color-slate-100)]">
                        {s.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link href="/catalogue" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 border-t border-[var(--color-slate-100)] hover:bg-[var(--color-slate-50)] transition-colors">
              <div className="h-9 w-9 rounded-xl bg-[var(--color-navy-900)] flex items-center justify-center shrink-0">
                <Grid3X3 className="h-4 w-4 text-white" />
              </div>
              <span className="flex-1 text-sm font-semibold text-[var(--color-navy-900)]">{t.allCatalog}</span>
            </Link>
          </div>

          {/* Auth */}
          <div className="px-4 py-3">
            {!user ? (
              <div className="flex gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}
                  className="flex-1 h-10 text-sm font-semibold rounded-md flex items-center justify-center border border-[var(--color-slate-300)] text-[var(--color-navy-900)]">
                  {t.login}
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}
                  className="flex-1 h-10 text-sm font-bold rounded-md flex items-center justify-center bg-[var(--color-accent)] text-[var(--color-navy-900)]">
                  {t.register}
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-3 px-2 py-2 mb-1">
                  <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-navy-900)]">{user.full_name}</p>
                    <p className="text-xs text-[var(--color-slate-400)] capitalize">{user.role}</p>
                  </div>
                </div>
                {[
                  { href: '/profil', label: t.myProfile },
                  { href: '/commandes', label: t.myOrders },
                  ...(user.role === 'vendor' || user.role === 'admin' ? [{ href: '/vendeur', label: t.vendorSpace }] : []),
                  ...(user.role === 'admin' ? [{ href: '/admin', label: t.administration }] : []),
                ].map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                    className="px-2 py-2.5 text-sm text-[var(--color-slate-700)] hover:bg-[var(--color-slate-50)] rounded-md transition-colors">
                    {item.label}
                  </Link>
                ))}
                <form action="/api/auth/signout" method="post">
                  <button className="w-full text-left px-2 py-2.5 text-sm text-[var(--color-danger)] hover:bg-[var(--color-slate-50)] rounded-md">
                    {t.logout}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
