'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Plus, Calendar, Clock, Building2, Navigation, Smartphone, Banknote, CreditCard } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { useLanguage } from '@/components/providers/language-provider'
import { sendOrderNotificationEmail } from '@/lib/notifications'
import type { Address } from '@/types'

interface Props { addresses: Address[]; userId: string | null }

const CITIES = ['Douala', 'Yaoundé']
const DAYS_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const DAYS_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const TIME_SLOTS = [
  '9h - 10h',
  '10h - 11h',
  '11h - 12h',
  '12h - 13h',
  '13h - 14h',
  '14h - 15h',
  '15h - 16h',
  '16h - 17h',
]

type PaymentMethod = 'cash' | 'orange_money' | 'mtn_momo'

interface NewDelivery {
  full_name: string
  phone: string
  quartier: string
  city: string
  delivery_day: string
  delivery_time: string
}

const PAYMENT_BASE: { id: PaymentMethod; bg: string; border: string; activeBg: string }[] = [
  { id: 'cash',        bg: 'bg-green-100',  border: 'border-green-400',  activeBg: 'bg-green-50'  },
  { id: 'orange_money', bg: 'bg-orange-100', border: 'border-orange-400', activeBg: 'bg-orange-50' },
  { id: 'mtn_momo',    bg: 'bg-yellow-100', border: 'border-yellow-400', activeBg: 'bg-yellow-50' },
]

const PAYMENT_ICONS: Record<PaymentMethod, React.ReactNode> = {
  cash:        <Banknote className="h-5 w-5 text-green-600" />,
  orange_money: <Smartphone className="h-5 w-5 text-orange-500" />,
  mtn_momo:    <Smartphone className="h-5 w-5 text-yellow-500" />,
}

export function CheckoutForm({ addresses, userId }: Props) {
  const router = useRouter()
  const { t, lang } = useLanguage()
  const { items, total, clearCart } = useCartStore()

  const DAYS = lang === 'fr' ? DAYS_FR : DAYS_EN

  const PAYMENT_OPTIONS = [
    { ...PAYMENT_BASE[0], label: lang === 'fr' ? 'Paiement à la livraison' : 'Payment on delivery', sub: lang === 'fr' ? 'Payez en cash à la réception' : 'Pay cash upon receipt' },
    { ...PAYMENT_BASE[1], label: 'Orange Money',      sub: lang === 'fr' ? 'Paiement mobile - prompt immédiat' : 'Mobile payment - instant prompt' },
    { ...PAYMENT_BASE[2], label: 'MTN Mobile Money',  sub: lang === 'fr' ? 'Paiement mobile - prompt immédiat' : 'Mobile payment - instant prompt' },
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
    delivery_time: '9h - 10h',
  })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const selectedCity = selectedAddress === 'new' || isGuest
    ? newDelivery.city
    : (addresses.find((a) => a.id === selectedAddress)?.city || 'Douala')

  function getShippingForStore(storeCity?: string | null) {
    const cCity = (selectedCity || 'Douala').trim().toLowerCase()
    const sCity = (storeCity || 'Douala').trim().toLowerCase()
    return cCity === sCity ? 1000 : 2000
  }

  const shipping = items.reduce((acc, item) => {
    const sCity = (item.product.store as any)?.city || 'Douala'
    const fee = getShippingForStore(sCity)
    return Math.max(acc, fee)
  }, 1000)

  const grandTotal = total() + shipping

  function set<K extends keyof NewDelivery>(field: K, value: string) {
    setNewDelivery((prev) => ({ ...prev, [field]: value }))
  }

  async function handleOrder() {
    setError(null)
    if (items.length === 0) { setError(t.cartEmpty); return }

    setLoading(true)
    const supabase = createClient()

    let shippingAddress: Record<string, string>

    if (selectedAddress === 'new' || isGuest) {
      const { full_name, phone, quartier, city, delivery_day, delivery_time } = newDelivery
      if (!full_name || !phone || !quartier || !city || !delivery_day || !delivery_time) {
        setError(lang === 'fr' ? 'Veuillez remplir tous les champs de livraison.' : 'Please fill in all delivery fields.')
        setLoading(false)
        return
      }
      shippingAddress = { full_name, phone, address_line: quartier, city, delivery_day, delivery_time, country: 'Cameroun' }
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

    const byStore: Record<string, typeof items> = {}
    for (const item of items) {
      const sid = item.product.store_id
      if (!byStore[sid]) byStore[sid] = []
      byStore[sid].push(item)
    }

    try {
      const orderIds: string[] = []
      const storeEntries = Object.entries(byStore)
      for (let index = 0; index < storeEntries.length; index++) {
        const [storeId, storeItems] = storeEntries[index]
        const storeCity = (storeItems[0]?.product.store as any)?.city || 'Douala'
        const storeShipping = index === 0 ? getShippingForStore(storeCity) : 0
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
            shipping_cost: storeShipping,
            total: storeSub + storeShipping,
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

        sendOrderNotificationEmail({
          orderId: order.id,
          customerName: shippingAddress.full_name || 'Client',
          customerPhone: shippingAddress.phone || '',
          city: shippingAddress.city || 'Douala',
          storeName: (storeItems[0]?.product?.store as any)?.name ?? 'Boutique BRICELO',
          totalAmount: storeSub + storeShipping,
          paymentMethod: paymentMethod,
          itemsCount: storeItems.length,
        })
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

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[var(--color-navy-900)] flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[var(--color-accent)]" /> {t.deliveryInfo}
          </h2>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">

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
                <p className="font-semibold text-[var(--color-navy-900)]">{addr.label} - {addr.full_name}</p>
                <p className="text-[var(--color-slate-500)]">{addr.address_line}, {addr.city}</p>
                <p className="text-[var(--color-slate-500)]">{addr.phone}</p>
              </div>
            </label>
          ))}

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

          {(selectedAddress === 'new' || isGuest) && (
            <div className="flex flex-col gap-3 mt-1">
              <div className="grid sm:grid-cols-2 gap-3">
                <Input label={t.fullName} value={newDelivery.full_name}
                  onChange={(e) => set('full_name', e.target.value)} required />
                <Input label={t.phone} value={newDelivery.phone}
                  onChange={(e) => set('phone', e.target.value)} required placeholder="+237 6XX XXX XXX" />
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
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

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--color-slate-600)] flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {lang === 'fr' ? 'Heure' : 'Time'}
                  </label>
                  <select value={newDelivery.delivery_time} onChange={(e) => set('delivery_time', e.target.value)}
                    className="h-10 px-3 text-sm border border-[var(--color-slate-300)] rounded-[var(--radius-lg)] focus:outline-none focus:border-[var(--color-navy-900)] bg-white text-[var(--color-navy-900)]">
                    {TIME_SLOTS.map(tSlot => <option key={tSlot} value={tSlot}>{tSlot}</option>)}
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
        </CardBody>
      </Card>

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

      <Button
        onClick={handleOrder}
        loading={loading}
        size="lg"
        className="w-full py-4 text-base font-extrabold shadow-lg bg-[var(--color-accent)] hover:bg-[var(--color-gold-600)] text-[var(--color-navy-900)] border-none btn-animate-attention"
      >
        {paymentMethod === 'cash' ? (lang === 'fr' ? 'Confirmer la commande' : t.confirmOrder) : t.payNow}
      </Button>
    </div>
  )
}
