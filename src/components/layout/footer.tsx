'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Truck, CreditCard, RotateCcw, Headphones, ChevronDown } from 'lucide-react'
import { FooterNewsletter } from './footer-newsletter'
import { FooterControls } from './footer-controls'
import { useLanguage } from '@/components/providers/language-provider'

const socials = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=100063727190585&mibextid=rS40aB7S9Ucbxw6v',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@briceloconfort',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@bricelo237?si=aDNFFwIP62zIFO1a',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/237652704218',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
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
  const { t, lang } = useLanguage()

  const features = [
    { icon: Truck,        title: t.footerDelivery,     desc: t.footerDeliveryDesc },
    { icon: CreditCard,   title: t.footerPayment,      desc: t.footerPaymentDesc },
    { icon: RotateCcw,    title: t.footerReturn,       desc: t.footerReturnDesc },
    { icon: Headphones,   title: t.footerSupport,      desc: t.footerSupportDesc },
  ]

  const quickLinks = [
    { href: '/commandes',           label: t.footerMyOrders },
    { href: '/panier',              label: t.footerMyCart },
    { href: '/contact',             label: t.customerService },
    { href: '/candidature-vendeur', label: t.footerSellOnBricelo },
  ]

  const infoLinks = [
    { href: '/faq',             label: t.footerFaq },
    { href: '/contact',         label: t.footerContactUs },
    { href: '/a-propos',        label: t.footerAboutUs },
    { href: '/register',        label: t.footerJoinUs },
    { href: '/confidentialite', label: t.footerPrivacy },
  ]

  const serviceLinks = [
    { href: '/a-propos',        label: t.footerBricoloAndYou },
    { href: '/modes-paiement',  label: t.footerPaymentModes },
    { href: '/contact',         label: t.footerReportProduct },
    { href: '/guide-achat',     label: t.footerHowToBuy },
    { href: '/promotions',      label: t.footerCoupons },
    { href: '/retours',         label: t.footerReturns },
  ]

  const accountLinks = [
    { href: '/profil',                label: t.footerMyProfile },
    { href: '/commandes',             label: t.myOrders },
    { href: '/adresses',              label: t.footerMyAddresses },
    { href: '/panier',                label: t.footerCart },
    { href: '/candidature-vendeur',   label: t.footerVendorApplication },
    { href: '/guide-achat',           label: t.footerBuyEasily },
    { href: '/devenir-vendeur',       label: t.footerBecomeVendor },
    { href: '/partenaires',           label: t.footerBecomePartner },
    { href: '/cgv',                   label: t.footerCgv },
  ]

  const sections = [
    { title: t.information,    links: infoLinks },
    { title: t.customerService, links: serviceLinks },
    { title: t.myAccount,      links: accountLinks },
  ]

  return (
    <footer className="mt-auto">
      {/* ── Feature bar (gold) ── */}
      <div className="bg-[var(--color-accent)]">
        {/* Desktop */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-4 py-5 border-b border-black/10">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-full bg-black/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 !text-slate-950" />
                </div>
                <div>
                  <p className="!text-slate-950 font-black text-sm leading-tight">{title}</p>
                  <p className="!text-slate-900 font-semibold text-xs mt-0.5">{desc}</p>
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
                  className="flex items-center gap-1.5 text-sm font-bold !text-slate-950 border border-slate-950/40 hover:border-slate-950 hover:bg-black/5 px-4 py-1.5 rounded transition-colors"
                >
                  <span className="text-xs opacity-60">↳</span> {l.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/login"    className="bg-[var(--color-navy-900)] text-white text-sm font-semibold px-5 py-2 rounded hover:bg-[var(--color-navy-950)] transition-colors">{t.login}</Link>
              <Link href="/register" className="bg-[var(--color-navy-950)] text-white text-sm font-semibold px-5 py-2 rounded hover:bg-black transition-colors">{t.register}</Link>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden px-4 py-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-2">
                <div className="shrink-0 w-8 h-8 rounded-full bg-black/10 flex items-center justify-center mt-0.5">
                  <Icon className="h-4 w-4 !text-slate-950" />
                </div>
                <div>
                  <p className="!text-slate-950 font-black text-xs leading-tight">{title}</p>
                  <p className="!text-slate-900 font-semibold text-[11px] leading-tight mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end border-t border-black/10 pt-3">
            <Link href="/login"    className="bg-[var(--color-navy-900)] text-white text-xs font-semibold px-4 py-2 rounded">{t.login}</Link>
            <Link href="/register" className="bg-[var(--color-navy-950)] text-white text-xs font-semibold px-4 py-2 rounded">{t.register}</Link>
          </div>
        </div>
      </div>

      {/* ── Main body (navy) ── */}
      <div className="bg-[var(--color-navy-900)] text-white">
        {/* Desktop: 4 columns */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <h4 className="text-sm font-bold text-[var(--color-accent)] mb-4 uppercase tracking-wide">{t.information}</h4>
              <LinkList links={infoLinks} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--color-accent)] mb-4 uppercase tracking-wide">{t.customerService}</h4>
              <LinkList links={serviceLinks} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--color-accent)] mb-4 uppercase tracking-wide">{t.myAccount}</h4>
              <LinkList links={accountLinks} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--color-accent)] mb-2 uppercase tracking-wide">{t.newsletter}</h4>
              <p className="text-sm text-white/65 leading-snug mb-1">{t.subscribeNewsletter}</p>
              <FooterNewsletter />
              <h4 className="text-sm font-bold text-[var(--color-accent)] mt-6 mb-3 uppercase tracking-wide">{t.followUs}</h4>
              <div className="flex items-center gap-2 flex-wrap">
                {socials.map(s => (
                  <a key={s.label} href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-[var(--color-accent)] hover:text-[var(--color-navy-900)] text-white flex items-center justify-center transition-colors">
                    {s.svg}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: logo + accordions */}
        <div className="md:hidden">
          <div className="px-4 pt-5 pb-4 border-b border-white/10 flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="BRICÉLO.com"
              width={200}
              height={60}
              className="h-12 w-auto object-contain rounded-lg shadow-2xs bg-white p-0.5"
            />
          </div>

          {sections.map(section => (
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

          <div className="bg-[var(--color-navy-950)] px-4 py-6 flex flex-col items-center text-center">
            <h4 className="text-sm font-bold text-[var(--color-accent)] mb-1 uppercase tracking-wide">{t.newsletter}</h4>
            <p className="text-sm text-white/65 mb-3">{t.subscribeNewsletter}</p>
            <div className="w-full max-w-sm">
              <FooterNewsletter />
            </div>
            <h4 className="text-sm font-bold text-[var(--color-accent)] mt-6 mb-3 uppercase tracking-wide">{t.followUs}</h4>
            <div className="flex items-center justify-center gap-3.5 flex-wrap">
              {socials.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[var(--color-accent)] hover:text-[var(--color-navy-900)] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-xs">
                  {s.svg}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Payment methods ── */}
      <div className="bg-[var(--color-navy-950)] border-t border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
            {lang === 'fr' ? 'Moyens de paiement acceptés' : 'Accepted payment methods'}
          </p>
          <div className="flex items-center justify-center gap-3 sm:gap-6 max-w-md mx-auto">
            <div className="flex items-center justify-center shrink-0">
              <Image src="/payments/cash.jpg" alt={t.cash} width={96} height={56} className="h-9 sm:h-12 w-auto object-contain rounded-xs" />
            </div>
            <div className="flex items-center justify-center shrink-0">
              <Image src="/payments/mtn-momo.png" alt="MTN Mobile Money" width={112} height={56} className="h-9 sm:h-12 w-auto object-contain rounded-xs" />
            </div>
            <div className="flex items-center justify-center shrink-0">
              <Image src="/payments/orange.jpg" alt="Orange Money" width={112} height={56} className="h-9 sm:h-12 w-auto object-contain rounded-xs" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Language + theme controls ── */}
      <div className="bg-[var(--color-navy-950)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FooterControls />
          <p className="text-xs text-white/40 text-center pb-3">
            {t.copyright(new Date().getFullYear())}
          </p>
        </div>
      </div>
    </footer>
  )
}
