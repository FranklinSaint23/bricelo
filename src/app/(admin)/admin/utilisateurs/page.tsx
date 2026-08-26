import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { UserAdminTable } from '@/components/admin/user-admin-table'

export default async function AdminUsersPage() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) redirect('/login')

  const supabase = await createClient()
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, email, phone, role, avatar_url, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--color-navy-900)]">Gestion des Utilisateurs</h1>
        <p className="text-sm text-[var(--color-slate-500)] mt-0.5">
          {users?.length ?? 0} comptes enregistrés • Modifier les profils, les rôles et réinitialiser les mots de passe
        </p>
      </div>

      <UserAdminTable initialUsers={(users as any) ?? []} currentAdminId={userId} />
    </div>
  )
}
