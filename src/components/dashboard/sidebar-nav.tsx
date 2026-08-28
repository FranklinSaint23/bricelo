'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Package, ShoppingBag, Store,
  Users, CreditCard, Tag, GraduationCap,
} from 'lucide-react'

const vendorItems = [
  { href: '/vendeur',           icon: LayoutDashboard, label: 'Tableau de bord', exact: true },
  { href: '/vendeur/produits',  icon: Package,          label: 'Mes produits',    exact: false },
  { href: '/vendeur/commandes', icon: ShoppingBag,      label: 'Commandes reçues',exact: false },
  { href: '/vendeur/boutique',  icon: Store,            label: 'Ma boutique',     exact: false },
]

const adminItems = [
  { href: '/admin',              icon: LayoutDashboard, label: 'Vue globale',   exact: true },
  { href: '/admin/utilisateurs', icon: Users,           label: 'Utilisateurs',  exact: false },
  { href: '/admin/vendeurs',     icon: Store,           label: 'Vendeurs',      exact: false },
  { href: '/admin/produits',     icon: Package,         label: 'Produits',      exact: false },
  { href: '/admin/categories',   icon: Tag,             label: 'Catégories',    exact: false },
  { href: '/admin/commandes',    icon: ShoppingBag,     label: 'Commandes',     exact: false },
  { href: '/admin/paiements',    icon: CreditCard,      label: 'Paiements',     exact: false },
  { href: '/admin/tutoriels',    icon: GraduationCap,   label: 'Académie & Tutos', exact: false },
]

export function SidebarNav({ variant }: { variant: 'vendor' | 'admin' }) {
  const pathname = usePathname()
  const items = variant === 'vendor' ? vendorItems : adminItems

  return (
    <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
      {items.map(({ href, icon: Icon, label, exact }) => {
        const isActive = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 py-2.5 rounded-lg text-sm transition-all border-l-2 pl-[10px] pr-3',
              isActive
                ? 'bg-white/15 text-white font-semibold border-[var(--color-accent)]'
                : 'text-white/60 hover:text-white hover:bg-white/[0.08] border-transparent'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
