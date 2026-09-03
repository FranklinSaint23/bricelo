import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getAdminClient } from '@/lib/supabase/admin'
import { Navbar } from '@/components/layout/navbar'
import { CinetPayButton } from '@/components/checkout/cinetpay-button'
import { formatPrice } from '@/lib/utils'
import { ShieldCheck, Store, MapPin, ShoppingBag, ShieldAlert, ArrowLeft } from 'lucide-react'
import { getPaymentSettings } from '@/lib/settings'

export default async function PaiementPage({ searchParams }: { searchParams: Promise<{ orders?: string; method?: string }> }) {
  const params = await searchParams
  const orderIds = params.orders?.split(',').filter(Boolean) ?? []
  const paymentMethod = params.method || 'orange_money'
  if (!orderIds.length) redirect('/panier')

  const paymentSettings = await getPaymentSettings()
  const isMethodDisabled =
    (paymentMethod === 'orange_money' && !paymentSettings.orange_money) ||
    (paymentMethod === 'mtn_momo' && !paymentSettings.mtn_momo) ||
    (!paymentSettings.orange_money && !paymentSettings.mtn_momo)

  const adminClient = getAdminClient()

  // 1. Récupérer les commandes de base avec le client admin (sans restriction RLS)
  const { data: basicOrders, error: baseErr } = await adminClient
    .from('orders')
    .select('id, total, subtotal, shipping_cost, status, shipping_address, store_id')
    .in('id', orderIds)

  if (baseErr) {
    console.error('[PaiementPage] Erreur récupération commandes:', baseErr)
  }

  const ordersList = basicOrders ?? []

  // 2. Charger les boutiques et les articles pour chaque commande
  const enrichedOrders = await Promise.all(
    ordersList.map(async (order) => {
      const [{ data: store }, { data: items }] = await Promise.all([
        adminClient.from('stores').select('name, city').eq('id', order.store_id).maybeSingle(),
        adminClient.from('order_items').select('id, quantity, unit_price, total_price, snapshot, product:products(name, images)').eq('order_id', order.id),
      ])

      return {
        ...order,
        store: store ?? { name: 'Boutique BRICELO', city: 'Douala' },
        order_items: items ?? [],
      }
    })
  )

  const grandTotal = enrichedOrders.reduce((s, o) => s + (o.total || 0), 0)

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[var(--color-slate-100)] flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-lg bg-white rounded-[var(--radius-2xl)] border border-[var(--color-slate-200)] p-6 sm:p-8 shadow-sm">
          {/* En-tête de paiement */}
          <div className="text-center mb-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)]/15 mb-3">
              <ShieldCheck className="h-7 w-7 text-[var(--color-accent)]" />
            </div>
            <h1 className="text-xl font-bold text-[var(--color-navy-900)]">Paiement sécurisé</h1>
            <p className="text-sm text-[var(--color-slate-500)] mt-0.5">Mobile Money (Orange / MTN)</p>
          </div>

          {/* Récapitulatif détaillé de la commande */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-navy-900)] uppercase tracking-wider">
              <ShoppingBag className="h-4 w-4 text-[var(--color-accent)]" />
              <span>Récapitulatif de votre commande</span>
            </div>

            {enrichedOrders.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 text-center font-medium">
                Commande #{orderIds[0]?.slice(0, 8).toUpperCase()} prêtre pour le règlement.
              </div>
            ) : (
              enrichedOrders.map((order) => {
                const storeName = (order.store as any)?.name ?? 'Boutique BRICELO'
                const storeCity = (order.store as any)?.city
                const items = order.order_items ?? []
                const addr = (order.shipping_address as any) ?? null

                return (
                  <div key={order.id} className="bg-[var(--color-slate-50)] rounded-xl border border-[var(--color-slate-200)] p-4 flex flex-col gap-3">
                    {/* Nom de la boutique / vendeur */}
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--color-slate-200)]">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-[var(--color-navy-900)] shrink-0" />
                        <span className="font-bold text-sm text-[var(--color-navy-900)]">{storeName}</span>
                        {storeCity && (
                          <span className="text-[10px] bg-white border border-[var(--color-slate-200)] px-2 py-0.5 rounded-full text-[var(--color-slate-500)] font-medium">
                            {storeCity}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-[var(--color-slate-400)]">#{order.id.slice(0, 8).toUpperCase()}</span>
                    </div>

                    {/* Articles commandés */}
                    <div className="flex flex-col gap-2.5">
                      {items.map((item: any) => {
                        const snap = (item.snapshot as any) ?? {}
                        const prodName = item.product?.name ?? snap.name ?? 'Article BRICELO'
                        const img = item.product?.images?.[0] ?? snap.image
                        return (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-white border border-[var(--color-slate-200)] shrink-0 overflow-hidden relative">
                              {img ? (
                                <Image src={img} alt={prodName} fill className="object-cover" sizes="40px" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400">BRICELO</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[var(--color-navy-900)] truncate">{prodName}</p>
                              <p className="text-[11px] text-[var(--color-slate-500)]">Qté : {item.quantity} × {formatPrice(item.unit_price)}</p>
                            </div>
                            <span className="text-xs font-bold text-[var(--color-navy-900)] shrink-0">{formatPrice(item.total_price)}</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Adresse de livraison */}
                    {addr && (
                      <div className="pt-2 border-t border-dashed border-[var(--color-slate-200)] flex items-start gap-1.5 text-[11px] text-[var(--color-slate-600)]">
                        <MapPin className="h-3.5 w-3.5 text-[var(--color-slate-400)] shrink-0 mt-0.5" />
                        <span className="truncate">Livraison à {addr.full_name || 'Client'} • {addr.address_line || addr.address_line1 || addr.city} ({addr.phone})</span>
                      </div>
                    )}

                    {/* Sous-total commande boutique */}
                    <div className="flex justify-between items-center pt-2 text-xs font-medium text-[var(--color-slate-600)]">
                      <span>Sous-total + Livraison ({formatPrice(order.shipping_cost)})</span>
                      <span className="font-bold text-[var(--color-navy-900)]">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                )
              })
            )}

            {/* Total Global */}
            <div className="bg-[var(--color-navy-900)] text-white rounded-xl p-4 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-xs text-white/70">Montant total de la commande</p>
                <p className="text-xs font-medium text-[var(--color-accent)]">{enrichedOrders.length} boutique{enrichedOrders.length > 1 ? 's' : ''} au total</p>
              </div>
              <span className="text-xl font-extrabold text-white">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          {isMethodDisabled ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-center flex flex-col items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-amber-600" />
              <div>
                <p className="text-sm font-bold text-amber-900">Paiement temporairement indisponible</p>
                <p className="text-xs text-amber-800 mt-1">
                  {paymentSettings.notice_message || 'Le paiement en ligne par Mobile Money est désactivé pour le moment.'}
                </p>
              </div>
              <Link
                href="/panier"
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-navy-900)] text-white text-xs font-bold rounded-lg hover:bg-[var(--color-navy-950)] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Retourner au panier
              </Link>
            </div>
          ) : (
            <CinetPayButton orderIds={orderIds} amount={grandTotal} paymentMethod={paymentMethod} />
          )}
        </div>
      </main>
    </>
  )
}
