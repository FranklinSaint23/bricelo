import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'

const roleBadge: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  admin: 'danger',
  vendor: 'warning',
  customer: 'default',
}

export default async function AdminUsersPage() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) redirect('/login')

  const supabase = await createClient()
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, email, role, avatar_url, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-navy-900)]">Utilisateurs</h1>
          <p className="text-sm text-[var(--color-slate-500)] mt-0.5">{users?.length ?? 0} comptes enregistrés</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[var(--color-slate-200)] overflow-hidden">
        {!users?.length ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <Users className="h-8 w-8 text-[var(--color-slate-200)]" />
            <p className="text-sm text-[var(--color-slate-400)]">Aucun utilisateur.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-slate-50)]">
                <tr>
                  {['Utilisateur', 'E-mail', 'Rôle', 'Inscription'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-slate-400)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-slate-50)]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--color-slate-50)] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar src={u.avatar_url} name={u.full_name} size="sm" />
                        <span className="font-medium text-[var(--color-navy-900)]">{u.full_name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--color-slate-500)]">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={roleBadge[u.role] ?? 'default'} size="sm">
                        {u.role === 'admin' ? 'Admin' : u.role === 'vendor' ? 'Vendeur' : 'Client'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--color-slate-500)]">{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
