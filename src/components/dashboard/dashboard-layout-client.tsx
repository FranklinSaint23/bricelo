'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, LogOut, ShieldAlert, Store, ExternalLink } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { SidebarNav } from '@/components/dashboard/sidebar-nav'

interface Profile {
  full_name: string | null
  avatar_url: string | null
  role: string
}

interface Props {
  profile: Profile
  variant: 'admin' | 'vendor'
  children: React.ReactNode
}

export function DashboardLayoutClient({ profile, variant, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Fermer le tiroir mobile après chaque navigation
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isAdmin = variant === 'admin'
  const bgColor = isAdmin ? 'bg-[var(--color-navy-950)]' : 'bg-[var(--color-navy-900)]'

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[var(--color-slate-100)]">
      {/* ── En-tête mobile (Visible uniquement sur mobile < 768px) ── */}
      <header className={`flex md:hidden items-center justify-between px-4 py-3 ${bgColor} text-white border-b border-white/10 shrink-0 sticky top-0 z-30`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.jpeg" alt="BRICELO" width={28} height={28} className="rounded-md object-contain" />
            <span className="text-white font-extrabold text-base">
              BRICE<span className="text-[var(--color-accent)]">LO</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-[var(--color-accent)] font-semibold">
            {isAdmin ? 'Admin' : 'Vendeur'}
          </span>
          <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
        </div>
      </header>

      {/* ── Sidebar Desktop (Fixe >= 768px) ── */}
      <aside className={`hidden md:flex w-64 ${bgColor} flex-col shrink-0 h-full border-r border-white/10`}>
        {/* Logo + badge */}
        <div className="px-5 py-4 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.jpeg" alt="BRICELO" width={36} height={36} className="rounded-md object-contain" />
            <div>
              <span className="text-white font-extrabold text-base leading-none">
                BRICE<span className="text-[var(--color-accent)]">LO</span>
              </span>
              <p className="text-[10px] text-white/40 leading-none mt-0.5 flex items-center gap-1">
                {isAdmin ? (
                  <>
                    <ShieldAlert className="h-2.5 w-2.5 text-[var(--color-accent)]" /> Administration
                  </>
                ) : (
                  <>
                    <Store className="h-2.5 w-2.5 text-[var(--color-accent)]" /> Espace Vendeur
                  </>
                )}
              </p>
            </div>
          </Link>
        </div>

        {/* Profil */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
          <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{profile.full_name ?? 'Compte'}</p>
            <p className="text-[11px] text-[var(--color-accent)]">{isAdmin ? 'Administrateur' : 'Vendeur'}</p>
          </div>
        </div>

        {/* Navigation */}
        <SidebarNav variant={variant} />

        {/* Pied de Sidebar */}
        <div className="p-3 border-t border-white/10 space-y-0.5">
          <Link href="/" className="flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/8 transition-colors">
            <span>← Site public</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <form action="/api/auth/signout" method="post">
            <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-[var(--color-danger)] hover:bg-white/8 transition-colors">
              <LogOut className="h-4 w-4" /> Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* ── Tiroir mobile (Drawer slidant < 768px) ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay sombre */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Panneau latéral */}
          <aside className={`relative w-4/5 max-w-xs ${bgColor} flex flex-col h-full shadow-2xl z-10 animate-slide-right`}>
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Image src="/logo.jpeg" alt="BRICELO" width={30} height={30} className="rounded-md object-contain" />
                <span className="text-white font-bold text-sm">
                  BRICE<span className="text-[var(--color-accent)]">LO</span> ({isAdmin ? 'Admin' : 'Vendeur'})
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profil */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
              <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{profile.full_name ?? 'Compte'}</p>
                <p className="text-[11px] text-[var(--color-accent)]">{isAdmin ? 'Administrateur' : 'Vendeur'}</p>
              </div>
            </div>

            {/* Nav list */}
            <div className="flex-1 overflow-y-auto">
              <SidebarNav variant={variant} />
            </div>

            {/* Bottom links */}
            <div className="p-3 border-t border-white/10 space-y-1">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10"
              >
                <span>← Retour au site</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
              <form action="/api/auth/signout" method="post">
                <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-[var(--color-danger)] hover:bg-white/10">
                  <LogOut className="h-4 w-4" /> Déconnexion
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}

      {/* ── Zone de contenu principal scrollable avec min-w-0 ── */}
      <main className="flex-1 overflow-y-auto min-w-0 flex flex-col">
        {children}
      </main>
    </div>
  )
}
