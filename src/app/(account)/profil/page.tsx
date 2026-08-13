import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/account/profile-form'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="p-6 sm:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-[var(--color-navy-900)] mb-8">Mon profil</h1>

      <div className="flex flex-col gap-6">
        {/* Avatar */}
        <Card>
          <CardBody className="flex items-center gap-4">
            <Avatar
              src={profile?.avatar_url}
              name={profile?.full_name ?? user.email ?? 'U'}
              size="lg"
            />
            <div>
              <p className="font-semibold text-[var(--color-navy-900)]">{profile?.full_name ?? 'Profil incomplet'}</p>
              <p className="text-sm text-[var(--color-slate-500)]">{user.email}</p>
            </div>
          </CardBody>
        </Card>

        {/* Formulaire */}
        <Card>
          <CardHeader><p className="font-semibold text-[var(--color-navy-900)]">Informations personnelles</p></CardHeader>
          <CardBody>
            <ProfileForm
              userId={user.id}
              initialData={{
                full_name: profile?.full_name ?? '',
                phone: profile?.phone ?? '',
              }}
            />
          </CardBody>
        </Card>

        {/* Email (lecture seule) */}
        <Card>
          <CardHeader><p className="font-semibold text-[var(--color-navy-900)]">Compte</p></CardHeader>
          <CardBody className="flex flex-col gap-3">
            <div>
              <p className="text-xs text-[var(--color-slate-500)] mb-1">Adresse e-mail</p>
              <p className="text-sm font-medium text-[var(--color-navy-900)]">{user.email}</p>
              <p className="text-xs text-[var(--color-slate-400)] mt-0.5">Modifiable via les paramètres de sécurité Supabase</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
