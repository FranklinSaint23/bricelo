'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Plus, CreditCard, Building2, Calendar, Clock, Navigation, User, Mail } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/components/providers/language-provider'
import { createClient } from '@/lib/supabase/client'
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
  email: string
  phone: string
  quartier: string
  city: string
  delivery_day: string
  delivery_time: string
}

export function CheckoutForm({ addresses, userId }: Props) {
  const router = useRouter()
  const { t, lang } = useLanguage()
  const { items, total, clearCart } = useCartStore()

  const DAYS = lang === 'fr' ? DAYS_FR : DAYS_EN

  const PAYMENT_OPTIONS = [
    {
      id: 'cash' as PaymentMethod,
      label: lang === 'fr' ? 'Paiement à la livraison' : 'Cash on delivery',
      shortLabel: lang === 'fr' ? 'Espèces' : 'Cash',
      imageSrc: '/payments/cash.jpg',
      logoBg: 'bg-emerald-50 dark:bg-emerald-950 border border-emerald-200/80',
      border: 'border-emerald-500',
      activeBg: 'bg-emerald-50/70 border-emerald-500',
      checkColor: 'bg-emerald-600 border-emerald-600',
    },
    {
      id: 'orange_money' as PaymentMethod,
      label: 'Orange Money',
      shortLabel: 'Orange Money',
      imageSrc: '/payments/orange.jpg',
      logoBg: 'bg-black border border-orange-500/50',
      border: 'border-orange-500',
      activeBg: 'bg-orange-50/70 border-orange-500',
      checkColor: 'bg-orange-600 border-orange-600',
    },
    {
      id: 'mtn_momo' as PaymentMethod,
      label: 'MTN Mobile Money',
      shortLabel: 'MTN MoMo',
      imageSrc: '/payments/mtn-momo.png',
      logoBg: 'bg-amber-400 border border-amber-500/50',
      border: 'border-amber-500',
      activeBg: 'bg-amber-50/70 border-amber-500',
      checkColor: 'bg-amber-600 border-amber-600',
    },
  ]

  const isGuest = !userId
  const hasDigitalItem = items.some((item) => (item.product as any)?.product_type === 'digital')

  const [selectedAddress, setSelectedAddress] = useState<string>(
    isGuest ? 'new' : (addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id ?? 'new'),
  )
  const [newDelivery, setNewDelivery] = useState<NewDelivery>({
    full_name: '',
    email: '',
    phone: '',
    quartier: '',
    city: 'Douala',
    delivery_day: 'Lundi',
    delivery_time: '9h - 10h',
  })

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(hasDigitalItem ? 'orange_money' : 'cash')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shipping = hasDigitalItem ? 0 : 1000
  const grandTotal = total() + shipping

  function set<K extends keyof NewDelivery>(field: K, value: string) {
    setNewDelivery((prev) => ({ ...prev, [field]: value }))
  }

  async function handleOrder() {
    setError(null)
    if (items.length === 0) { setError(t.cartEmpty); return }

    let shippingAddress: { full_name: string; phone: string; email?: string; city: string; address_line: string }

    if (hasDigitalItem) {
      if (!newDelivery.full_name.trim() || !newDelivery.phone.trim() || !newDelivery.email.trim()) {
        setError(lang === 'fr' ? 'Veuillez remplir votre nom, numéro de téléphone et adresse email.' : 'Please fill in your name, phone and email address.')
        return
      }
      if (!newDelivery.email.includes('@')) {
        setError(lang === 'fr' ? 'Veuillez saisir une adresse email valide.' : 'Please enter a valid email address.')
        return
      }

      shippingAddress = {
        full_name: newDelivery.full_name.trim(),
        phone: newDelivery.phone.trim(),
        email: newDelivery.email.trim(),
        city: 'Digital / Téléchargement',
        address_line: 'Accès Produit Numérique (Téléchargement Direct)',
      }
    } else if (selectedAddress === 'new' || isGuest) {
      if (!newDelivery.full_name.trim() || !newDelivery.phone.trim() || !newDelivery.quartier.trim()) {
        setError(lang === 'fr' ? 'Veuillez remplir tous les champs obligatoires' : 'Please fill in all required fields')
        return
      }

      shippingAddress = {
        full_name: newDelivery.full_name.trim(),
        phone: newDelivery.phone.trim(),
        email: newDelivery.email.trim() || undefined,
        city: newDelivery.city,
        address_line: `${newDelivery.quartier.trim()} (Créneau : ${newDelivery.delivery_day} ${newDelivery.delivery_time})`,
      }
    } else {
      const addr = addresses.find((a) => a.id === selectedAddress)
      if (!addr) { setError(lang === 'fr' ? 'Veuillez choisir une adresse de livraison' : 'Please select a delivery address'); return }
      shippingAddress = {
        full_name: addr.full_name,
        phone: addr.phone,
        email: newDelivery.email.trim() || undefined,
        city: addr.city,
        address_line: addr.address_line,
      }
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const storeMap: Record<string, typeof items> = {}
      for (const item of items) {
        const sId = item.product.store_id ?? 'default'
        if (!storeMap[sId]) storeMap[sId] = []
        storeMap[sId].push(item)
      }

      const orderIds: string[] = []
      const storeEntries = Object.entries(storeMap)

      for (let index = 0; index < storeEntries.length; index++) {
        const [storeId, storeItems] = storeEntries[index]
        const storeSub = storeItems.reduce((a, i) => a + (i.product.price + (i.variant?.price_adjustment ?? 0)) * i.quantity, 0)
        const storeShipping = index === 0 ? shipping : 0

        const { data: order, error: orderErr } = await supabase
          .from('orders')
          .insert({
            user_id: userId ?? null,
            store_id: storeId === 'default' ? null : storeId,
            status: 'pending',
            payment_method: paymentMethod,
            subtotal: storeSub,
            shipping_cost: storeShipping,
            total: storeSub + storeShipping,
            shipping_address: shippingAddress,
          })
          .select('id')
          .single()

        if (orderErr || !order) throw orderErr ?? new Error(lang === 'fr' ? 'Erreur lors de la création de la commande' : 'Error creating order')

        const orderItems = storeItems.map((i) => {
          const v = i.variant as any
          const unitPrice = (v?.price && v.price > 0)
            ? v.price
            : (v?.direct_price && v.direct_price > 0)
            ? v.direct_price
            : i.product.price + (v?.price_adjustment ?? 0)

          const variantName = v?.name || v?.value || null
          const sku = v?.sku || null
          const itemImage = v?.images?.[0]?.url || i.product.images?.[0] || null

          const optionsMap: Record<string, string> = {}
          if (v?.option_values && Array.isArray(v.option_values)) {
            v.option_values.forEach((ov: any) => {
              if (ov.option?.name && ov.value) {
                optionsMap[ov.option.name] = ov.value
              }
            })
          }

          return {
            order_id: order.id,
            product_id: i.product.id,
            variant_id: (i.variant?.id && !i.variant.id.includes('_')) ? i.variant.id : null,
            quantity: i.quantity,
            unit_price: unitPrice,
            total_price: unitPrice * i.quantity,
            snapshot: {
              product_id: i.product.id,
              variant_id: i.variant?.id ?? null,
              name: i.product.name,
              variant_name: variantName,
              sku: sku,
              image: itemImage,
              unit_price: unitPrice,
              quantity: i.quantity,
              options_snapshot: optionsMap,
            },
          }
        })
        const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)
        if (itemsErr) throw itemsErr

        for (const item of storeItems) {
          if (item.variant?.id && !item.variant.id.includes('_')) {
            try {
              await supabase.rpc('decrement_variant_stock', {
                p_variant_id: item.variant.id,
                p_quantity: item.quantity,
              })
            } catch (rpcErr) {
              console.warn('RPC decrement_variant_stock fallback:', rpcErr)
            }
          }
        }

        orderIds.push(order.id)

        const storeData = storeItems[0]?.product?.store as any

        sendOrderNotificationEmail({
          orderId: order.id,
          createdAt: new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' }),
          customerName: shippingAddress.full_name || newDelivery.full_name || 'Client',
          customerEmail: shippingAddress.email || newDelivery.email || null,
          customerPhone: shippingAddress.phone || newDelivery.phone || '',
          city: shippingAddress.city || newDelivery.city || 'Douala',
          addressLine: (shippingAddress as any).address_line || `${newDelivery.quartier}`,
          storeName: storeData?.name ?? 'Boutique BRICELO',
          storePhone: storeData?.phone ?? null,
          totalAmount: storeSub + storeShipping,
          subtotal: storeSub,
          shippingCost: storeShipping,
          paymentMethod: paymentMethod,
          itemsCount: storeItems.length,
          items: storeItems.map(i => {
            const v = i.variant as any
            const uPrice = (v?.price && v.price > 0)
              ? v.price
              : (v?.direct_price && v.direct_price > 0)
              ? v.direct_price
              : i.product.price + (v?.price_adjustment ?? 0)

            return {
              name: i.product.name,
              variantName: v?.name || v?.value || null,
              quantity: i.quantity,
              unitPrice: uPrice,
              totalPrice: uPrice * i.quantity,
            }
          }),
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
            {hasDigitalItem ? (
              <><User className="h-4 w-4 text-[var(--color-accent)]" /> Informations de l'acheteur (Accès Digital)</>
            ) : (
              <><MapPin className="h-4 w-4 text-[var(--color-accent)]" /> {t.deliveryInfo}</>
            )}
          </h2>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">

          {hasDigitalItem ? (
            <div className="flex flex-col gap-3">
              <Input
                label="Nom & Prénom *"
                value={newDelivery.full_name}
                onChange={(e) => set('full_name', e.target.value)}
                placeholder="Ex: Jean Paul"
                required
                className="h-10 px-3 text-sm border border-[var(--color-slate-300)] rounded-[var(--radius-lg)]"
              />
              <Input
                label="Numéro de téléphone *"
                value={newDelivery.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="Ex: 699000000"
                required
                className="h-10 px-3 text-sm border border-[var(--color-slate-300)] rounded-[var(--radius-lg)]"
              />
              <Input
                label="Adresse Email *"
                type="email"
                value={newDelivery.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="ex: jean.paul@gmail.com"
                required
                className="h-10 px-3 text-sm border border-[var(--color-slate-300)] rounded-[var(--radius-lg)]"
              />
            </div>
          ) : (
            <>
              {!isGuest && addresses.map((addr) => (
                <label key={addr.id}
                  className={`flex items-start gap-3 p-3 rounded-[var(--radius-lg)] border cursor-pointer transition-colors ${
                    selectedAddress === addr.id
                      ? 'border-[var(--color-accent)] bg-amber-50'
                      : 'border-[var(--color-slate-200)] hover:bg-[var(--color-slate-50)]'
                  }`}>
                  <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id}
                    onChange={() => setSelectedAddress(addr.id)} className="mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-navy-900)]">{addr.full_name}</p>
                    <p className="text-xs text-[var(--color-slate-500)]">{addr.phone}</p>
                    <p className="text-xs text-[var(--color-slate-500)]">{addr.address_line}, {addr.city}</p>
                  </div>
                </label>
              ))}

              {(isGuest || selectedAddress === 'new') && (
                <div className="flex flex-col gap-3">
                  <Input
                    label={t.fullName}
                    value={newDelivery.full_name}
                    onChange={(e) => set('full_name', e.target.value)}
                    placeholder="Ex: Jean Paul"
                    required
                    className="h-10 px-3 text-sm border border-[var(--color-slate-300)] rounded-[var(--radius-lg)]"
                  />
                  <Input
                    label={t.phone}
                    value={newDelivery.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    placeholder="Ex: 699000000"
                    required
                    className="h-10 px-3 text-sm border border-[var(--color-slate-300)] rounded-[var(--radius-lg)]"
                  />
                  <Input
                    label="Adresse Email (Optionnelle)"
                    type="email"
                    value={newDelivery.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="ex: jean.paul@gmail.com"
                    className="h-10 px-3 text-sm border border-[var(--color-slate-300)] rounded-[var(--radius-lg)]"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-navy-900)] mb-1">
                        {t.city}
                      </label>
                      <select
                        value={newDelivery.city}
                        onChange={(e) => set('city', e.target.value)}
                        className="w-full h-10 px-3 text-sm border border-[var(--color-slate-300)] rounded-[var(--radius-lg)] bg-white text-[var(--color-navy-900)] focus:outline-none cursor-pointer"
                      >
                        {CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label={t.neighborhood}
                      value={newDelivery.quartier}
                      onChange={(e) => set('quartier', e.target.value)}
                      placeholder={t.neighborhoodPlaceholder}
                      required
                      className="h-10 px-3 text-sm border border-[var(--color-slate-300)] rounded-[var(--radius-lg)]"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 pt-1">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[var(--color-slate-600)] flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {t.deliveryDay}
                      </label>
                      <select value={newDelivery.delivery_day} onChange={(e) => set('delivery_day', e.target.value)}
                        className="h-10 px-3 text-sm border border-[var(--color-slate-300)] rounded-[var(--radius-lg)] bg-white text-[var(--color-navy-900)]">
                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[var(--color-slate-600)] flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {lang === 'fr' ? 'Heure' : 'Time'}
                      </label>
                      <select value={newDelivery.delivery_time} onChange={(e) => set('delivery_time', e.target.value)}
                        className="h-10 px-3 text-sm border border-[var(--color-slate-300)] rounded-[var(--radius-lg)] bg-white text-[var(--color-navy-900)]">
                        {TIME_SLOTS.map(tSlot => <option key={tSlot} value={tSlot}>{tSlot}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[var(--color-navy-900)] flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[var(--color-accent)]" /> {t.paymentMethod}
          </h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {hasDigitalItem && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-start gap-2">
              <span>
                Votre panier contient un produit digital. Le paiement en espèces est désactivé. Veuillez choisir un mode de paiement en ligne sécurisé (Orange Money ou MTN Mobile Money).
              </span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {PAYMENT_OPTIONS.map((opt) => {
              const isDisabled = hasDigitalItem && opt.id === 'cash'
              const isSelected = paymentMethod === opt.id
              return (
                <label
                  key={opt.id}
                  className={`flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-xl border-2 transition-all text-center relative ${
                    isDisabled
                      ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200'
                      : isSelected
                      ? `${opt.activeBg} cursor-pointer`
                      : 'border-[var(--color-slate-200)] bg-white hover:bg-[var(--color-slate-50)] cursor-pointer'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.id}
                    disabled={isDisabled}
                    checked={isSelected}
                    onChange={() => !isDisabled && setPaymentMethod(opt.id)}
                    className="sr-only"
                  />

                  <div className="absolute top-2 right-2">
                    <div className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? `${opt.checkColor} text-white` : 'border-[var(--color-slate-300)] bg-white'
                    }`}>
                      {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  <div className={`h-11 w-full max-w-[85px] rounded-lg flex items-center justify-center overflow-hidden p-1.5 my-1.5 transition-transform ${opt.logoBg} ${isSelected ? 'scale-105 shadow-2xs' : 'opacity-90'}`}>
                    <img
                      src={opt.imageSrc}
                      alt={opt.label}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <span className={`text-[11px] sm:text-xs font-extrabold leading-tight line-clamp-1 ${isSelected ? 'text-[var(--color-navy-900)]' : 'text-[var(--color-slate-600)]'}`}>
                    {isDisabled ? 'Non dispo' : opt.shortLabel}
                  </span>
                </label>
              )
            })}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[var(--color-navy-900)]">
            {t.orderSummary(items.length)}
          </h2>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 divide-y divide-[var(--color-slate-100)]">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.variant?.id}`} className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--color-navy-900)]">{item.product.name}</span>
                  {item.variant && <span className="text-xs text-[var(--color-slate-400)]">({item.variant.value})</span>}
                  <span className="text-xs text-[var(--color-slate-500)]">× {item.quantity}</span>
                </div>
                <span className="text-sm font-semibold text-[var(--color-navy-900)]">
                  {formatPrice((item.product.price + (item.variant?.price_adjustment ?? 0)) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--color-slate-200)] pt-3 flex flex-col gap-1.5">
            <div className="flex justify-between text-sm text-[var(--color-slate-500)]">
              <span>{t.subtotal}</span>
              <span>{formatPrice(total())}</span>
            </div>
            <div className="flex justify-between text-sm text-[var(--color-slate-500)]">
              <span>{t.shipping}</span>
              <span className="font-semibold text-[var(--color-navy-900)]">
                {hasDigitalItem ? 'Offert (0 FCFA)' : formatPrice(shipping)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-[var(--color-navy-900)] pt-2 border-t border-[var(--color-slate-100)]">
              <span>{t.total}</span>
              <span className="text-lg text-[var(--color-accent)]">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-[var(--radius-md)] text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <Button onClick={handleOrder} loading={loading} size="lg" className="w-full mt-2 font-bold py-4">
            {paymentMethod === 'cash'
              ? (lang === 'fr' ? 'Valider la commande (Paiement à la livraison)' : 'Confirm order (Cash on delivery)')
              : (lang === 'fr' ? 'Procéder au paiement mobile' : 'Proceed to mobile payment')}
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}
