import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { CreditCard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'

export default async function AdminPaiementsPage() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) redirect('/login')

  const supabase = await createClient()
  const { data: payments } = await supabase
    .from('payments')
    .select('id, amount, status, provider, transaction_ref, created_at, order:orders(id, store:stores(name))')
    .order('created_at', { ascending: false })
    .limit(100)

  const totalSuccess = payments?.filter((p) => p.status === 'success').reduce((s, p) => s + p.amount, 0) ?? 0

  const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    success: 'success',
    pending: 'warning',
    failed: 'danger',
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--color-navy-900)]">Paiements</h1>
        <p className="text-sm text-[var(--color-slate-500)] mt-0.5">{payments?.length ?? 0} transaction{(payments?.length ?? 0) > 1 ? 's' : ''}</p>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-l-4 border-emerald-400 p-4">
          <p className="text-xs text-[var(--color-slate-500)]">Volume confirmé</p>
          <p className="text-xl font-bold text-[var(--color-navy-900)] mt-0.5">{formatPrice(totalSuccess)}</p>
        </div>
        <div className="bg-white rounded-xl border border-l-4 border-[var(--color-slate-300)] p-4">
          <p className="text-xs text-[var(--color-slate-500)]">Transactions</p>
          <p className="text-xl font-bold text-[var(--color-navy-900)] mt-0.5">{payments?.length ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-l-4 border-amber-400 p-4">
          <p className="text-xs text-[var(--color-slate-500)]">En attente</p>
          <p className="text-xl font-bold text-[var(--color-navy-900)] mt-0.5">{payments?.filter((p) => p.status === 'pending').length ?? 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[var(--color-slate-200)] overflow-hidden">
        {!payments?.length ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <CreditCard className="h-8 w-8 text-[var(--color-slate-200)]" />
            <p className="text-sm text-[var(--color-slate-400)]">Aucun paiement enregistré.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-slate-50)]">
                <tr>
                  {['ID', 'Boutique', 'Montant', 'Statut', 'Opérateur', 'Réf. transaction', 'Date'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-slate-400)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-slate-50)]">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--color-slate-50)] transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-[var(--color-slate-400)]">#{p.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-5 py-3.5 text-[var(--color-navy-900)]">{(p.order as any)?.store?.name ?? '—'}</td>
                    <td className="px-5 py-3.5 font-bold text-[var(--color-navy-900)]">{formatPrice(p.amount)}</td>
                    <td className="px-5 py-3.5"><Badge variant={statusVariant[p.status] ?? 'default'} size="sm">{p.status}</Badge></td>
                    <td className="px-5 py-3.5 text-[var(--color-slate-500)] capitalize">{p.provider ?? '—'}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-[var(--color-slate-400)]">{p.transaction_ref ?? '—'}</td>
                    <td className="px-5 py-3.5 text-[var(--color-slate-500)]">{formatDate(p.created_at)}</td>
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
