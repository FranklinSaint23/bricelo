import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ShoppingBag, Smartphone, Banknote, MessageSquare } from 'lucide-react'
import { OrderStatusBadge } from '@/components/ui/badge'
import { ValidateCashButton } from '@/components/admin/validate-cash-button'
import { formatPrice, formatDate } from '@/lib/utils'

export default async function AdminCommandesPage() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) redirect('/login')

  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('id, total, status, payment_method, shipping_address, created_at, store:stores(name, phone), user:users(full_name, email, phone)')
    .order('created_at', { ascending: false })
    .limit(100)

  const byStatus: Record<string, number> = {}
  orders?.forEach((o) => { byStatus[o.status] = (byStatus[o.status] ?? 0) + 1 })

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-navy-900)]">Gestion des Commandes</h1>
          <p className="text-sm text-[var(--color-slate-500)] mt-0.5">
            {orders?.length ?? 0} commande{(orders?.length ?? 0) > 1 ? 's' : ''} au total • Suivi des ramassages & livraisons
          </p>
        </div>
      </div>

      {/* Résumé statuts */}
      {Object.keys(byStatus).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(byStatus).map(([status, count]) => (
            <div key={status} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[var(--color-slate-200)] text-xs shadow-2xs">
              <OrderStatusBadge status={status} />
              <span className="font-bold text-[var(--color-navy-900)]">{count}</span>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-[var(--color-slate-200)] overflow-hidden shadow-2xs">
        {!orders?.length ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <ShoppingBag className="h-8 w-8 text-[var(--color-slate-200)]" />
            <p className="text-sm text-[var(--color-slate-400)]">Aucune commande en cours.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-slate-50)]">
                <tr>
                  {['ID', 'Client', 'Boutique (Vendeur)', 'Date', 'Montant', 'Paiement', 'Statut', 'Actions Logistique'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-slate-400)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-slate-50)]">
                {orders.map((o) => {
                  const isCashPending = o.payment_method === 'cash' && o.status === 'pending'
                  const addr = (o.shipping_address as any) ?? {}
                  const clientPhone = addr.phone || (o.user as any)?.phone || ''
                  const clientName = addr.full_name || (o.user as any)?.full_name || 'Client'
                  const storePhone = (o.store as any)?.phone || ''
                  const storeName = (o.store as any)?.name ?? 'Boutique BRICELO'

                  const clientWaText = `Bonjour ${clientName}, c'est l'équipe BRICELO concernant votre commande #${o.id.slice(0, 8).toUpperCase()} de ${formatPrice(o.total)}.`
                  const storeWaText = `Bonjour ${storeName}, c'est BRICELO concernant le ramassage de la commande #${o.id.slice(0, 8).toUpperCase()}.`

                  return (
                    <tr key={o.id} className="hover:bg-[var(--color-slate-50)] transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs text-[var(--color-slate-400)]">#{o.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-[var(--color-navy-900)]">{clientName}</p>
                        <p className="text-xs text-[var(--color-slate-500)]">{clientPhone || (o.user as any)?.email || '—'}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-[var(--color-slate-700)]">{storeName}</p>
                        {storePhone && <p className="text-[11px] text-[var(--color-slate-400)]">{storePhone}</p>}
                      </td>
                      <td className="px-4 py-3.5 text-[var(--color-slate-500)]">{formatDate(o.created_at)}</td>
                      <td className="px-4 py-3.5 font-bold text-[var(--color-navy-900)]">{formatPrice(o.total)}</td>
                      <td className="px-4 py-3.5">
                        <PaymentMethodBadge method={o.payment_method} />
                      </td>
                      <td className="px-4 py-3.5"><OrderStatusBadge status={o.status} /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isCashPending && <ValidateCashButton orderId={o.id} />}
                          
                          {clientPhone && (
                            <a
                              href={`https://wa.me/${clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(clientWaText)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Contacter le client sur WhatsApp"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                              <MessageSquare className="h-3 w-3" /> Client
                            </a>
                          )}

                          {storePhone && (
                            <a
                              href={`https://wa.me/${storePhone.replace(/\D/g, '')}?text=${encodeURIComponent(storeWaText)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Contacter le vendeur pour le ramassage"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg hover:bg-amber-100 transition-colors"
                            >
                              <MessageSquare className="h-3 w-3" /> Vendeur
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function PaymentMethodBadge({ method }: { method: string | null }) {
  if (method === 'orange_money') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
        <Smartphone className="h-3 w-3" /> Orange
      </span>
    )
  }
  if (method === 'mtn_momo') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        <Smartphone className="h-3 w-3" /> MTN
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      <Banknote className="h-3 w-3" /> Espèces
    </span>
  )
}
