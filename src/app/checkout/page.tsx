import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { CheckoutForm } from '@/components/checkout/checkout-form'
import { getPaymentSettings } from '@/lib/settings'

export default async function CheckoutPage() {
  const supabase = await createClient()
  const [{ data: { user } }, paymentSettings] = await Promise.all([
    supabase.auth.getUser(),
    getPaymentSettings(),
  ])

  const addresses = user
    ? (await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
      ).data ?? []
    : []

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[var(--color-slate-100)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-[var(--color-navy-900)] mb-6">Finaliser ma commande</h1>
          <CheckoutForm addresses={addresses} userId={user?.id ?? null} paymentSettings={paymentSettings} />
        </div>
      </main>
    </>
  )
}
