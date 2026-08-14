'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Plus, Calendar, Building2, Navigation, Smartphone, Banknote, CreditCard } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { useLanguage } from '@/components/providers/language-provider'
import type { Address } from '@/types'

interface Props { addresses: Address[]; userId: string | null }

const CITIES = ['Douala', 'Yaoundé']
const DAYS_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const DAYS_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type PaymentMethod = 'orange_money' | 'mtn_momo' | 'cash'

interface NewDelivery {
  full_name: string
  phone: string
  quartier: string
  city: string
  delivery_day: string
}

const PAYMENT_BASE: { id: PaymentMethod; bg: string; border: string; activeBg: string }[] = [
  { id: 'orange_money', bg: 'bg-orange-100', border: 'border-orange-400', activeBg: 'bg-orange-50' },
  { id: 'mtn_momo',    bg: 'bg-yellow-100', border: 'border-yellow-400', activeBg: 'bg-yellow-50' },
  { id: 'cash',        bg: 'bg-green-100',  border: 'border-green-400',  activeBg: 'bg-green-50'  },
]

const PAYMENT_ICONS: Record<PaymentMethod, React.ReactNode> = {
  orange_money: <Smartphone className="h-5 w-5 text-orange-500" />,
  mtn_momo:    <Smartphone className="h-5 w-5 text-yellow-500" />,
  cash:        <Banknote className="h-5 w-5 text-green-600" />,
}

export function CheckoutForm({ addresses, userId }: Props) {
  const router = useRouter()
  const { t, lang } = useLanguage()
  const { items, total, clearCart } = useCartStore()

  const DAYS = lang === 'fr' ? DAYS_FR : DAYS_EN

  const PAYMENT_OPTIONS = [
    { ...PAYMENT_BASE[0], label: 'Orange Money',      sub: lang === 'fr' ? 'Paiement mobile — prompt immédiat' : 'Mobile payment — instant prompt' },
    { ...PAYMENT_BASE[1], label: 'MTN Mobile Money',  sub: lang === 'fr' ? 'Paiement mobile — prompt immédiat' : 'Mobile payment — instant prompt' },
    { ...PAYMENT_BASE[2], label: lang === 'fr' ? 'Espèces à la livraison' : 'Cash on delivery', sub: lang === 'fr' ? 'Payez en cash à la réception' : 'Pay cash upon receipt' },
  ]

  const isGuest = !userId

  const [selectedAddress, setSelectedAddress] = useState<string>(
    isGuest ? 'new' : (addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id ?? 'new'),
  )
  const [newDelivery, setNewDelivery] = useState<NewDelivery>({
    full_name: '',
    phone: '',
    quartier: '',
    city: 'Douala',
    delivery_day: 'Lundi',
  })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('orange_money')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const subtotal   = total()
  const shipping   = 2000
  const grandTotal = subtotal + shipping

  function set(field: keyof NewDelivery, value: string) {
    setNewDelivery(prev => ({ ...prev, [field]: value }))
  }

  async function handleOrder() {
    setError(null)
    if (items.length === 0) { setError(t.cartEmpty); return }

    setLoading(true)
    const supabase = createClient()

    let shippingAddress: Record<string, string>

    if (selectedAddress === 'new' || isGuest) {
      const { full_name, phone, quartier, city, delivery_day } = newDelivery
      if (!full_name || !phone || !quartier || !city || !delivery_day) {
        setError(lang === 'fr' ? 'Veuillez remplir tous les champs de livraison.' : 'Please fill in all delivery fields.')
        setLoading(false)
        return
      }
      shippingAddress = { full_name, phone, address_line: quartier, city, delivery_day, country: 'Cameroun' }
    } else {
      const addr = addresses.find((a) => a.id === selectedAddress)
      if (!addr) { setError(lang === 'fr' ? 'Adresse introuvable.' : 'Address not found.'); setLoading(false); return }
      shippingAddress = {
        full_name: addr.full_name,
        phone: addr.phone,
        address_line: addr.address_line,
        city: addr.city,
        country: addr.country,
      }
    }

    // Grouper par boutique
    const byStore: Record<string, typeof items> = {}
    for (const item of items) {
      const sid = item.product.store_id
      if (!byStore[sid]) byStore[sid] = []
      byStore[sid].push(item)
    }

    try {
      const orderIds: string[] = []
      for (const [storeId, storeItems] of Object.entries(byStore)) {
        const storeSub = storeItems.reduce(
          (s, i) => s + (i.product.price + (i.variant?.price_adjustment ?? 0)) * i.quantity, 0,
        )
        const { data: order, error: orderErr } = await supabase
          .from('orders')
          .insert({
            user_id: userId,
            store_id: storeId,
            status: 'pending',
            subtotal: storeSub,
            shipping_cost: shipping,
            total: storeSub + shipping,
            shipping_address: shippingAddress,
            payment_method: paymentMethod,
          })
          .select('id')
          .single()
        if (orderErr) throw orderErr

        const orderItems = storeItems.map((i) => ({
          order_id: order.id,
          product_id: i.product.id,
          variant_id: i.variant?.id ?? null,
          quantity: i.quantity,
          unit_price: i.product.price + (i.variant?.price_adjustment ?? 0),
          total_price: (i.product.price + (i.variant?.price_adjustment ?? 0)) * i.quantity,
          snapshot: { name: i.product.name, image: i.product.images?.[0] ?? null },
        }))
        await supabase.from('order_items').insert(orderItems)
        orderIds.push(order.id)
      }

      clearCart()
      if (paymentMethod === 'cash') {
        router.push(`/commande-confirmee?orders=${orderIds.join(',')}`)
      } else {
        router.push(`/paiement?orders=${orderIds.join(',')}`)
      }
    } catch (err: any) {
      setError(err.message ?? t.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Delivery info */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[var(--color-navy-900)] flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[var(--color-accent)]" /> {t.deliveryInfo}
          </h2>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">

          {/* Adresses sauvegardées (utilisateurs connectés) */}
          {!isGuest && addresses.map((addr) => (
            <label key={addr.id}
              className={`flex items-start gap-3 p-3 rounded-[var(--radius-lg)] border cursor-pointer transition-colors ${
                selectedAddress === addr.id
                  ? 'border-[var(--color-accent)] bg-amber-50'
                  : 'border-[var(--color-slate-200)] hover:bg-[var(--color-slate-50)]'
              }`}>
              <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id}
                onChange={() => setSelectedAddress(addr.id)} className="mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-[var(--color-navy-900)]">{addr.label} — {addr.full_name}</p>
                <p className="text-[var(--color-slate-500)]">{addr.address_line}, {addr.city}</p>
                <p className="text-[var(--color-slate-500)]">{addr.phone}</p>
              </div>
            </label>
          ))}

          {/* Bouton "Nouvelle adresse" (uniquement si connecté et adresses existantes) */}
          {!isGuest && (
            <label className={`flex items-center gap-3 p-3 rounded-[var(--radius-lg)] border cursor-pointer transition-colors ${
              selectedAddress === 'new'
                ? 'border-[var(--color-accent)] bg-amber-50'
                : 'border-dashed border-[var(--color-slate-300)] hover:bg-[var(--color-slate-50)]'
            }`}>
              <input type="radio" name="address" value="new" checked={selectedAddress === 'new'}
                onChange={() => setSelectedAddress('new')} />
              <Plus className="h-4 w-4 text-[var(--color-slate-400)]" />
              <span className="text-sm text-[var(--color-slate-600)]">{t.newAddress}</span>
            </label>
          )}

          {/* Formulaire de livraison */}
          {(selectedAddress === 'new' || isGuest) && (
            <div className="flex flex-col gap-3 mt-1">

              {/* Nom + Téléphone */}
              <div className="grid sm:grid-cols-2 gap-3">
                <Input label={t.fullName} value={newDelivery.full_name}
                  onChange={(e) => set('full_name', e.target.value)} required />
                <Input label={t.phone} value={newDelivery.phone}
                  onChange={(e) => set('phone', e.target.value)} required placeholder="+237 6XX XXX XXX" />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--color-slate-600)] flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" /> {t.city}
                  </label>
                  <select value={newDelivery.city} onChange={(e) => set('city', e.target.value)}
                    className="h-10 px-3 text-sm border border-[var(--color-slate-300)] rounded-[var(--radius-lg)] focus:outline-none focus:border-[var(--color-navy-900)] bg-white text-[var(--color-navy-900)]">
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--color-slate-600)] flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {t.deliveryDay}
                  </label>
                  <select value={newDelivery.delivery_day} onChange={(e) => set('delivery_day', e.target.value)}
                    className="h-10 px-3 text-sm border border-[var(--color-slate-300)] rounded-[var(--radius-lg)] focus:outline-none focus:border-[var(--color-navy-900)] bg-white text-[var(--color-navy-900)]">
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[var(--color-slate-600)] flex items-center gap-1">
                  <Navigation className="h-3.5 w-3.5" /> {t.neighborhood}
                </label>
                <input
                  type="text"
                  value={newDelivery.quartier}
                  onChange={(e) => set('quartier', e.target.value)}
                  placeholder={t.neighborhoodPlaceholder}
                  required
                  className="h-10 px-3 text-sm border border-[var(--color-slate-300)] rounded-[var(--radius-lg)] focus:outline-none focus:border-[var(--color-navy-900)] text-[var(--color-navy-900)] placeholder:text-[var(--color-slate-400)]"
                />
              </div>

            </div>
          )}
        </CardBody>
      </Card>

      {/* Payment method */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[var(--color-navy-900)] flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[var(--color-accent)]" /> {t.paymentMethod}
          </h2>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          {PAYMENT_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className={`flex items-center gap-3 p-3.5 rounded-[var(--radius-lg)] border-2 cursor-pointer transition-all ${
                paymentMethod === opt.id
                  ? `${opt.border} ${opt.activeBg}`
                  : 'border-[var(--color-slate-200)] hover:bg-[var(--color-slate-50)]'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={opt.id}
                checked={paymentMethod === opt.id}
                onChange={() => setPaymentMethod(opt.id)}
                className="sr-only"
              />
              <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${opt.bg}`}>
                {PAYMENT_ICONS[opt.id]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--color-navy-900)]">{opt.label}</p>
                <p className="text-xs text-[var(--color-slate-500)]">{opt.sub}</p>
              </div>
              <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                paymentMethod === opt.id ? `${opt.border} ${opt.bg}` : 'border-[var(--color-slate-300)]'
              }`}>
                {paymentMethod === opt.id && <div className="h-2 w-2 rounded-full bg-current" />}
              </div>
            </label>
          ))}

          {paymentMethod === 'cash' && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-800 flex items-start gap-2">
              <span className="text-base shrink-0">ℹ️</span>
              <span>{t.cashNote}</span>
            </div>
          )}

          {(paymentMethod === 'orange_money' || paymentMethod === 'mtn_momo') && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2.5 text-xs text-blue-800 flex items-start gap-2">
              <span className="text-base shrink-0">📱</span>
              <span>{t.mobileMoneyNote}</span>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Order summary */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[var(--color-navy-900)]">
            {t.orderSummary(items.length)}
          </h2>
        </CardHeader>
        <CardBody className="flex flex-col gap-2 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-[var(--color-slate-700)]">
              <span className="truncate max-w-[70%]">{item.product.name} ×{item.quantity}</span>
              <span className="font-medium">
                {formatPrice((item.product.price + (item.variant?.price_adjustment ?? 0)) * item.quantity)}
              </span>
            </div>
          ))}
          <hr className="border-[var(--color-slate-200)] my-1" />
          <div className="flex justify-between text-[var(--color-slate-600)]">
            <span>{t.delivery}</span><span>{formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between font-bold text-base text-[var(--color-navy-900)]">
            <span>{t.total}</span><span>{formatPrice(grandTotal)}</span>
          </div>
        </CardBody>
      </Card>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button onClick={handleOrder} loading={loading} size="lg" className="w-full">
        {paymentMethod === 'cash' ? t.confirmOrder : t.payNow}
      </Button>
    </div>
  )
}
