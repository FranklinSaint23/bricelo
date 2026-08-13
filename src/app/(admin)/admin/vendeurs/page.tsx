import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Store, ClipboardList } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { AdminToggleStore } from '@/components/admin/toggle-store'
import { AdminApplicationActions } from '@/components/admin/application-actions'

export default async function AdminVendeursPage() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) redirect('/login')

  const supabase = await createClient()
  const [{ data: stores }, { data: applications }] = await Promise.all([
    supabase
      .from('stores')
      .select('id, name, slug, is_active, rating, review_count, created_at, user:users(full_name, email)')
      .order('created_at', { ascending: false }),
    supabase
      .from('vendor_applications')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

  const pending   = (applications ?? []).filter((a) => a.status === 'pending')
  const processed = (applications ?? []).filter((a) => a.status !== 'pending')

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-10">

      {/* ── CANDIDATURES ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-navy-900)] flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-amber-500" />
              Candidatures vendeur
            </h2>
            <p className="text-sm text-[var(--color-slate-500)] mt-0.5">
              {pending.length} en attente · {processed.length} traitée{processed.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[var(--color-slate-200)] overflow-hidden">
          {!pending.length && !processed.length ? (
            <div className="py-14 flex flex-col items-center gap-2 text-center">
              <ClipboardList className="h-8 w-8 text-[var(--color-slate-200)]" />
              <p className="text-sm text-[var(--color-slate-400)]">Aucune candidature pour le moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-slate-50)]">
                  <tr>
                    {['Candidat', 'Entreprise', 'Ville', 'Contact', 'Date', 'Statut', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-slate-400)] uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-slate-50)]">
                  {[...pending, ...processed].map((a) => (
                    <tr key={a.id} className="hover:bg-[var(--color-slate-50)] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--color-navy-900)]">{a.full_name}</p>
                        <p className="text-xs text-[var(--color-slate-400)] capitalize">{a.gender ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--color-navy-900)]">{a.business_name}</p>
                        <p className="text-xs text-[var(--color-slate-400)]">{a.business_type ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-slate-600)]">{a.city ?? '—'}</td>
                      <td className="px-4 py-3">
                        <p className="text-[var(--color-navy-900)]">{a.email}</p>
                        <p className="text-xs text-[var(--color-slate-400)]">{a.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-slate-500)] whitespace-nowrap">
                        {formatDate(a.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {a.status === 'pending'  && <Badge variant="warning" size="sm">En attente</Badge>}
                        {a.status === 'approved' && <Badge variant="success" size="sm">Approuvée</Badge>}
                        {a.status === 'rejected' && <Badge variant="danger"  size="sm">Refusée</Badge>}
                      </td>
                      <td className="px-4 py-3">
                        {a.status === 'pending' && (
                          <AdminApplicationActions applicationId={a.id} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ── BOUTIQUES ACTIVES ── */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[var(--color-navy-900)] flex items-center gap-2">
            <Store className="h-5 w-5 text-[var(--color-accent)]" />
            Boutiques enregistrées
          </h2>
          <p className="text-sm text-[var(--color-slate-500)] mt-0.5">
            {stores?.length ?? 0} boutique{(stores?.length ?? 0) > 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[var(--color-slate-200)] overflow-hidden">
          {!stores?.length ? (
            <div className="py-14 flex flex-col items-center gap-2 text-center">
              <Store className="h-8 w-8 text-[var(--color-slate-200)]" />
              <p className="text-sm text-[var(--color-slate-400)]">Aucune boutique.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-slate-50)]">
                  <tr>
                    {['Boutique', 'Propriétaire', 'Note', 'Statut', 'Créée le', 'Action'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-slate-400)] uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-slate-50)]">
                  {stores.map((s) => (
                    <tr key={s.id} className="hover:bg-[var(--color-slate-50)] transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-[var(--color-navy-900)]">{s.name}</p>
                        <p className="text-xs text-[var(--color-slate-400)]">/boutique/{s.slug}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[var(--color-navy-900)]">{(s.user as any)?.full_name ?? '—'}</p>
                        <p className="text-xs text-[var(--color-slate-400)]">{(s.user as any)?.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[var(--color-slate-500)]">
                        {s.rating > 0 ? `${Number(s.rating).toFixed(1)}/5 (${s.review_count})` : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={s.is_active ? 'success' : 'warning'} size="sm">
                          {s.is_active ? 'Active' : 'En attente'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-[var(--color-slate-500)]">{formatDate(s.created_at)}</td>
                      <td className="px-5 py-3.5">
                        <AdminToggleStore storeId={s.id} isActive={s.is_active} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
