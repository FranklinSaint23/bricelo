import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { CinetPayButton } from '@/components/checkout/cinetpay-button'
import { formatPrice } from '@/lib/utils'
import { ShieldCheck } from 'lucide-react'

interface PageProps { searchParams: Promise<{ orders?: string }> }

export default async function PaiementPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const orderIds = params.orders?.split(',').filter(Boolean) ?? []
  if (!orderIds.length) redirect('/panier')

  const { data: orders } = await supabase
    .from('orders')
    .select('id, total, status, store:stores(name)')
    .in('id', orderIds)
    .eq('user_id', user.id)

  if (!orders?.length) redirect('/commandes')

  const grandTotal = orders.reduce((s, o) => s + o.total, 0)

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[var(--color-slate-100)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-[var(--radius-2xl)] border border-[var(--color-slate-200)] p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)]/15 mb-3">
              <ShieldCheck className="h-7 w-7 text-[var(--color-accent)]" />
            </div>
            <h1 className="text-xl font-bold text-[var(--color-navy-900)]">Paiement sécurisé</h1>
            <p className="text-sm text-[var(--color-slate-500)] mt-1">Via CinetPay - vos données sont protégées</p>
          </div>

          <div className="bg-[var(--color-slate-50)] rounded-[var(--radius-lg)] p-4 mb-6 flex flex-col gap-2">
            {orders.map((order) => (
              <div key={order.id} className="flex justify-between text-sm">
                <span className="text-[var(--color-slate-600)]">Commande - {(order.store as any)?.name}</span>
                <span className="font-semibold text-[var(--color-navy-900)]">{formatPrice(order.total)}</span>
              </div>
            ))}
            <hr className="border-[var(--color-slate-200)] my-1" />
            <div className="flex justify-between font-bold text-[var(--color-navy-900)]">
              <span>Total à payer</span>
              <span className="text-lg">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <CinetPayButton orderIds={orderIds} amount={grandTotal} />
        </div>
      </main>
    </>
  )
}
