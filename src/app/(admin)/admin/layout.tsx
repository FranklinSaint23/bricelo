import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayoutClient } from '@/components/dashboard/dashboard-layout-client'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) redirect('/login')

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, avatar_url, role')
    .eq('id', userId)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/')

  return (
    <DashboardLayoutClient profile={profile} variant="admin">
      {children}
    </DashboardLayoutClient>
  )
}
