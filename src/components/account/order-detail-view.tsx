'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, MapPin, Package, CheckCircle2, Clock, Truck, Star, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { useLanguage } from '@/components/providers/language-provider'

type OrderItem = {
  id: string
  quantity: number
  unit_price: number
  product?: { id: string; name: string; images: string[]; slug: string } | null
}

type Order = {
  id: string
  order_number: string
  status: string
  total: number
  subtotal: number
  shipping_cost: number
  created_at: string
  shipping_address: Record<string, string> | null
  order_items: OrderItem[]
}

const STEPS = ['pending', 'confirmed', 'shipped', 'delivered'] as const

export function OrderDetailView({ order }: { order: Order }) {
  const { lang } = useLanguage()
  const fr = lang === 'fr'

  const STATUS_LABELS: Record<string, string> = {
    pending:   fr ? 'En attente de paiement' : 'Awaiting payment',
    confirmed: fr ? 'Commande confirmée'     : 'Order confirmed',
    shipped:   fr ? 'En cours de livraison'  : 'Out for delivery',
    delivered: fr ? 'Livrée'                 : 'Delivered',
    cancelled: fr ? 'Annulée'                : 'Cancelled',
  }

  const STATUS_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    pending:   'warning',
    confirmed: 'info',
    shipped:   'info',
    delivered: 'success',
    cancelled: 'danger',
  }

  const STEP_LABELS: Record<string, string> = {
    pending:   fr ? 'Reçue'     : 'Received',
    confirmed: fr ? 'Confirmée' : 'Confirmed',
    shipped:   fr ? 'Expédiée'  : 'Shipped',
    delivered: fr ? 'Livrée'    : 'Delivered',
  }

  const STEP_ICONS = {
    pending:   Clock,
    confirmed: CheckCircle2,
    shipped:   Truck,
    delivered: Star,
  }

  const isCancelled = order.status === 'cancelled'
  const currentStep = isCancelled ? -1 : STEPS.indexOf(order.status as typeof STEPS[number])

  const addr = order.shipping_address

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      <Link
        href="/commandes"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-slate-500)] hover:text-[var(--color-navy-900)] transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        {fr ? 'Mes commandes' : 'My orders'}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--color-navy-900)]">
            {fr ? 'Commande' : 'Order'} #{order.order_number}
          </h1>
          <p className="text-sm text-[var(--color-slate-500)] mt-0.5">
            {fr ? 'Passée le' : 'Placed on'}{' '}
            {new Date(order.created_at).toLocaleDateString(fr ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Badge variant={STATUS_VARIANTS[order.status] ?? 'default'}>
          {STATUS_LABELS[order.status] ?? order.status}
        </Badge>
      </div>

      {/* Status timeline */}
      {isCancelled ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex items-center gap-3">
          <XCircle className="h-6 w-6 text-red-500 shrink-0" />
          <div>
            <p className="font-semibold text-red-800">{fr ? 'Commande annulée' : 'Order cancelled'}</p>
            <p className="text-sm text-red-600 mt-0.5">
              {fr ? 'Cette commande a été annulée. Contactez le support si vous avez des questions.' : 'This order was cancelled. Contact support if you have any questions.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[var(--color-slate-200)] rounded-2xl p-5 mb-6 shadow-sm">
          <p className="text-xs font-bold text-[var(--color-slate-400)] uppercase tracking-wider mb-4">
            {fr ? 'Suivi de votre commande' : 'Order tracking'}
          </p>
          <div className="relative flex items-start">
            {/* Progress line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-[var(--color-slate-200)]" style={{ zIndex: 0 }}>
              <div
                className="h-full bg-[var(--color-accent)] transition-all duration-500"
                style={{ width: currentStep >= 0 ? `${(currentStep / (STEPS.length - 1)) * 100}%` : '0%' }}
              />
            </div>

            {STEPS.map((step, i) => {
              const StepIcon = STEP_ICONS[step]
              const done = i <= currentStep
              const active = i === currentStep
              return (
                <div key={step} className="flex-1 flex flex-col items-center gap-2 relative z-10">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    done
                      ? active
                        ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-navy-900)]'
                        : 'bg-[var(--color-navy-900)] border-[var(--color-navy-900)] text-white'
                      : 'bg-white border-[var(--color-slate-200)] text-[var(--color-slate-300)]'
                  }`}>
                    <StepIcon className="h-4 w-4" />
                  </div>
                  <p className={`text-[10px] sm:text-xs font-semibold text-center leading-tight ${
                    done ? 'text-[var(--color-navy-900)]' : 'text-[var(--color-slate-400)]'
                  }`}>
                    {STEP_LABELS[step]}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Items */}
        <div className="bg-white border border-[var(--color-slate-200)] rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--color-slate-100)]">
            <Package className="h-4 w-4 text-[var(--color-slate-400)]" />
            <p className="font-semibold text-[var(--color-navy-900)] text-sm">
              {fr ? 'Articles commandés' : 'Ordered items'}
            </p>
          </div>
          <div className="flex flex-col divide-y divide-[var(--color-slate-100)]">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-[var(--color-slate-100)]">
                  {item.product?.images?.[0] && (
                    <Image src={item.product.images[0]} alt={item.product?.name ?? ''} fill className="object-cover" sizes="64px" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={item.product?.slug ? `/produit/${item.product.slug}` : '#'}
                    className="font-medium text-[var(--color-navy-900)] line-clamp-2 text-sm hover:underline"
                  >
                    {item.product?.name}
                  </Link>
                  <p className="text-xs text-[var(--color-slate-500)] mt-0.5">
                    {fr ? 'Qté' : 'Qty'} : {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-[var(--color-navy-900)] shrink-0 text-sm">
                  {formatPrice(item.unit_price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white border border-[var(--color-slate-200)] rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-slate-100)]">
            <p className="font-semibold text-[var(--color-navy-900)] text-sm">
              {fr ? 'Récapitulatif' : 'Summary'}
            </p>
          </div>
          <div className="px-5 py-4 flex flex-col gap-2">
            <div className="flex justify-between text-sm text-[var(--color-slate-600)]">
              <span>{fr ? 'Sous-total' : 'Subtotal'}</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-[var(--color-slate-600)]">
              <span>{fr ? 'Livraison' : 'Delivery'}</span>
              <span>{order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : (fr ? 'Gratuite' : 'Free')}</span>
            </div>
            <div className="flex justify-between font-bold text-[var(--color-navy-900)] pt-2 border-t border-[var(--color-slate-200)] mt-1">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Address */}
        {addr && (
          <div className="bg-white border border-[var(--color-slate-200)] rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--color-slate-100)]">
              <MapPin className="h-4 w-4 text-[var(--color-slate-400)]" />
              <p className="font-semibold text-[var(--color-navy-900)] text-sm">
                {fr ? 'Adresse de livraison' : 'Delivery address'}
              </p>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-[var(--color-slate-700)] leading-relaxed">
                {addr.full_name}<br />
                {addr.address_line1}<br />
                {addr.address_line2 && <>{addr.address_line2}<br /></>}
                {addr.city}{addr.region ? `, ${addr.region}` : ''}<br />
                {addr.country} {addr.postal_code}<br />
                {addr.phone}
              </p>
            </div>
          </div>
        )}

        {/* Help CTA */}
        <div className="bg-[var(--color-slate-50)] border border-[var(--color-slate-200)] rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <p className="text-sm text-[var(--color-slate-600)]">
            {fr ? 'Un problème avec cette commande ?' : 'An issue with this order?'}
          </p>
          <Link
            href="/contact"
            className="shrink-0 text-sm font-semibold text-[var(--color-accent)] hover:underline"
          >
            {fr ? 'Contacter le support' : 'Contact support'}
          </Link>
        </div>
      </div>
    </div>
  )
}
