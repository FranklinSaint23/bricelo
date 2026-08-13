import Link from 'next/link'
import Image from 'next/image'
import { Truck, CreditCard, RotateCcw, Headphones, ChevronDown } from 'lucide-react'
import { FooterNewsletter } from './footer-newsletter'

const features = [
  { icon: Truck,        title: 'Livraison rapide',           desc: 'Entre 1 et 4 jours' },
  { icon: CreditCard,   title: 'Plusieurs moyens de paiement', desc: 'Cash / Mobile Money' },
  { icon: RotateCcw,    title: 'Retour sous 10 jours',       desc: 'Si le produit a un problème' },
  { icon: Headphones,   title: 'Service client de qualité',  desc: 'Disponible 7j/7' },
]

const quickLinks = [
  { href: '/commandes',          label: 'Mes Commandes' },
  { href: '/panier',             label: 'Voir Mon Panier' },
  { href: '/contact',            label: 'Service client' },
  { href: '/candidature-vendeur', label: 'Vendre sur BRICELO' },
]

const infoLinks = [
  { href: '/faq',            label: 'FAQ' },
  { href: '/contact',        label: 'Contactez-nous' },
  { href: '/a-propos',       label: 'Qui sommes-nous' },
  { href: '/register',       label: 'Rejoignez-nous' },
  { href: '/confidentialite', label: 'Politique de confidentialité' },
]

const serviceLinks = [
  { href: '/a-propos',        label: 'BRICELO et vous !' },
  { href: '/modes-paiement',  label: 'Mode de paiement' },
  { href: '/contact',         label: 'Signaler un produit' },
  { href: '/guide-achat',     label: 'Comment acheter sur BRICELO' },
  { href: '/promotions',      label: 'Utiliser un coupon de réduction' },
  { href: '/retours',         label: 'Retour et remboursement' },
]

const accountLinks = [
  { href: '/profil',                label: 'Mon compte' },
  { href: '/commandes',             label: 'Mes commandes' },
  { href: '/adresses',              label: 'Mes adresses' },
  { href: '/panier',                label: 'Panier' },
  { href: '/candidature-vendeur',    label: 'Candidature vendeur' },
  { href: '/guide-achat',           label: 'Achetez facilement' },
  { href: '/devenir-vendeur',       label: 'Comment devenir vendeur' },
  { href: '/partenaires',           label: 'Devenir partenaire logistique' },
  { href: '/cgv',                   label: 'CGV' },
]

const socials = [
  {
    label: 'Facebook',
    href: '#',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: '#',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: 'Twitter / X',
    href: '#',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: '#',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: '#',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
      </svg>
    ),
  },
]

function LinkList({ links }: { links: { href: string; label: string }[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {links.map(l => (
        <li key={l.href}>
          <Link href={l.href} className="text-sm text-white/65 hover:text-white transition-colors leading-snug">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function Footer() {
  return (
    <footer className="mt-auto">
      {/* ── Barre features (or/ambre) ── */}
      <div className="bg-[var(--color-accent)]">
        {/* Desktop */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-4 py-5 border-b border-black/10">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-[var(--color-navy-900)]" />
                </div>
                <div>
                  <p className="text-[var(--color-navy-900)] font-bold text-sm leading-tight">{title}</p>
                  <p className="text-[var(--color-navy-900)]/70 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {quickLinks.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-navy-900)] border border-[var(--color-navy-900)]/40 hover:border-[var(--color-navy-900)] hover:bg-black/5 px-4 py-1.5 rounded transition-colors"
                >
                  <span className="text-xs opacity-60">↳</span> {l.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/login"    className="bg-[var(--color-navy-900)] text-white text-sm font-semibold px-5 py-2 rounded hover:bg-[var(--color-navy-950)] transition-colors">Connexion</Link>
              <Link href="/register" className="bg-[var(--color-navy-950)] text-white text-sm font-semibold px-5 py-2 rounded hover:bg-black transition-colors">S'inscrire</Link>
            </div>
          </div>
        </div>

        {/* Mobile — 2 features + quick actions */}
        <div className="md:hidden px-4 py-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-2">
                <div className="shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                  <Icon className="h-4 w-4 text-[var(--color-navy-900)]" />
                </div>
                <div>
                  <p className="text-[var(--color-navy-900)] font-bold text-xs leading-tight">{title}</p>
                  <p className="text-[var(--color-navy-900)]/65 text-[11px]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end border-t border-black/10 pt-3">
            <Link href="/login"    className="bg-[var(--color-navy-900)] text-white text-xs font-semibold px-4 py-2 rounded">Connexion</Link>
            <Link href="/register" className="bg-[var(--color-navy-950)] text-white text-xs font-semibold px-4 py-2 rounded">S'inscrire</Link>
          </div>
        </div>
      </div>

      {/* ── Corps principal (navy) ── */}
      <div className="bg-[var(--color-navy-900)] text-white">
        {/* Desktop: 4 colonnes */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <h4 className="text-sm font-bold text-[var(--color-accent)] mb-4 uppercase tracking-wide">Information</h4>
              <LinkList links={infoLinks} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--color-accent)] mb-4 uppercase tracking-wide">Service client</h4>
              <LinkList links={serviceLinks} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--color-accent)] mb-4 uppercase tracking-wide">Mon compte</h4>
              <LinkList links={accountLinks} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--color-accent)] mb-2 uppercase tracking-wide">Newsletter</h4>
              <p className="text-sm text-white/65 leading-snug mb-1">
                Abonnez-vous et profitez de nos bons plans
              </p>
              <FooterNewsletter />
              <h4 className="text-sm font-bold text-[var(--color-accent)] mt-6 mb-3 uppercase tracking-wide">Suivez-nous</h4>
              <div className="flex items-center gap-2 flex-wrap">
                {socials.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-[var(--color-accent)] hover:text-[var(--color-navy-900)] text-white flex items-center justify-center transition-colors"
                  >
                    {s.svg}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: logo + accordéons */}
        <div className="md:hidden">
          {/* Logo mobile */}
          <div className="px-4 pt-5 pb-4 border-b border-white/10 flex items-center gap-2">
            <span className="text-white font-extrabold text-lg tracking-tight">
              BRICE<span className="text-[var(--color-accent)]">LO</span>
              <span className="text-white/40 font-light text-sm">.com</span>
            </span>
          </div>

          {/* Accordéons */}
          {[
            { title: 'Information',    links: infoLinks },
            { title: 'Service client', links: serviceLinks },
            { title: 'Mon compte',     links: accountLinks },
          ].map(section => (
            <details key={section.title} className="border-b border-white/10 group">
              <summary className="flex items-center justify-between px-4 py-4 cursor-pointer list-none font-semibold text-[var(--color-accent)] text-sm select-none">
                {section.title}
                <ChevronDown className="h-4 w-4 text-white/50 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-4 pb-4 flex flex-col gap-2">
                <LinkList links={section.links} />
              </div>
            </details>
          ))}

          {/* Newsletter mobile */}
          <div className="bg-[var(--color-navy-950)] px-4 py-5">
            <h4 className="text-sm font-bold text-[var(--color-accent)] mb-1 uppercase tracking-wide">Newsletter</h4>
            <p className="text-sm text-white/65 mb-2">Abonnez-vous et profitez de nos bons plans</p>
            <FooterNewsletter />
            <h4 className="text-sm font-bold text-[var(--color-accent)] mt-5 mb-3 uppercase tracking-wide">Suivez-nous</h4>
            <div className="flex items-center gap-2 flex-wrap">
              {socials.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[var(--color-accent)] hover:text-[var(--color-navy-900)] text-white flex items-center justify-center transition-colors"
                >
                  {s.svg}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Moyens de paiement ── */}
      <div className="bg-white border-t border-slate-200 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-slate-400 font-medium uppercase tracking-widest mb-4">Moyens de paiement acceptés</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex flex-col items-center gap-1.5">
              <Image src="/payments/cash.jpg" alt="Espèces" width={96} height={56} className="h-14 w-auto object-contain" />
              <span className="text-xs text-slate-500 font-medium">Espèces</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Image src="/payments/orange-money.png" alt="Orange Money" width={112} height={56} className="h-14 w-auto object-contain" />
              <span className="text-xs text-slate-500 font-medium">Orange Money</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Image src="/payments/mtn-momo.png" alt="MTN Mobile Money" width={112} height={56} className="h-14 w-auto object-contain" />
              <span className="text-xs text-slate-500 font-medium">MTN MoMo</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Copyright ── */}
      <div className="bg-[var(--color-navy-950)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-center">
          <p className="text-xs text-white/40">
            Copyright © {new Date().getFullYear()} BRICELO.com — Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
