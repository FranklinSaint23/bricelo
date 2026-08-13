import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Plus, MapPin } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AddressActions } from '@/components/account/address-actions'
import { AddAddressModal } from '@/components/account/add-address-modal'

export default async function AddressesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: addresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-navy-900)]">Mes adresses</h1>
        <AddAddressModal userId={user.id} />
      </div>

      {!addresses?.length ? (
        <div className="bg-white rounded-[var(--radius-2xl)] border border-dashed border-[var(--color-slate-300)] p-16 flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 rounded-full bg-[var(--color-slate-100)] flex items-center justify-center">
            <MapPin className="h-8 w-8 text-[var(--color-slate-400)]" />
          </div>
          <div>
            <p className="font-semibold text-[var(--color-navy-900)]">Aucune adresse enregistrée</p>
            <p className="text-sm text-[var(--color-slate-500)] mt-1">Ajoutez une adresse pour accélérer vos achats.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {addresses.map((addr) => (
            <Card key={addr.id}>
              <CardBody className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-[var(--color-slate-400)] mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-[var(--color-navy-900)]">{addr.label ?? addr.full_name}</p>
                      {addr.is_default && <Badge variant="info">Par défaut</Badge>}
                    </div>
                    <p className="text-sm text-[var(--color-slate-600)]">
                      {addr.full_name}<br />
                      {addr.address_line1}
                      {addr.address_line2 && <>, {addr.address_line2}</>}<br />
                      {addr.city}{addr.region ? `, ${addr.region}` : ''} — {addr.country}<br />
                      {addr.phone}
                    </p>
                  </div>
                </div>
                <AddressActions addressId={addr.id} isDefault={addr.is_default} />
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
