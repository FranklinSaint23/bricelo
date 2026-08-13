import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { ScrollToTop } from '@/components/ui/scroll-to-top'

const geistSans = GeistSans
const geistMono = GeistMono

export const metadata: Metadata = {
  title: { default: 'BRICELO — Marketplace multi-vendeurs', template: '%s | BRICELO' },
  description: 'Découvrez des milliers de produits sur BRICELO, la marketplace de confiance. Qualité, confiance, livraison rapide.',
  keywords: ['marketplace', 'ecommerce', 'Cameroun', 'boutique en ligne', 'bricelo'],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'BRICELO',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        {children}
        <ScrollToTop />
      </body>
    </html>
  )
}
