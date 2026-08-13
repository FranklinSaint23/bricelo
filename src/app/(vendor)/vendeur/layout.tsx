import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { LogOut } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { SidebarNav } from '@/components/dashboard/sidebar-nav'

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) redirect('/login')

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, avatar_url, role')
    .eq('id', userId)
    .single()

  if (!profile || !['vendor', 'admin'].includes(profile.role)) redirect('/')

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-slate-100)]">
      {/* Sidebar fixe */}
      <aside className="w-64 bg-[var(--color-navy-900)] flex flex-col shrink-0 h-full">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.jpeg" alt="BRICELO" width={36} height={36} className="rounded-md object-contain" />
            <div>
              <span className="text-white font-extrabold text-base leading-none">
                BRICE<span className="text-[var(--color-accent)]">LO</span>
              </span>
              <p className="text-[10px] text-white/40 leading-none mt-0.5">Espace Vendeur</p>
            </div>
          </Link>
        </div>

        {/* Profil */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
          <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{profile.full_name ?? 'Mon compte'}</p>
            <p className="text-[11px] text-[var(--color-accent)]">Vendeur</p>
          </div>
        </div>

        {/* Navigation */}
        <SidebarNav variant="vendor" />

        {/* Pied de sidebar */}
        <div className="p-3 border-t border-white/10 space-y-0.5">
          <Link href="/" className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/8 transition-colors">
            ← Site public
          </Link>
          <form action="/api/auth/signout" method="post">
            <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-[var(--color-danger)] hover:bg-white/8 transition-colors">
              <LogOut className="h-4 w-4" /> Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* Contenu principal scrollable */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
