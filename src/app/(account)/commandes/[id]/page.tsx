import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, MapPin, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
  pending:   'En attente de paiement',
  confirmed: 'Commande confirmée',
  shipped:   'En cours de livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

const STATUS_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending:   'warning',
  confirmed: 'info',
  shipped:   'info',
  delivered: 'success',
  cancelled: 'danger',
}

interface Props { params: Promise<{ id: string }> }

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id, order_number, status, total_amount, subtotal, shipping_amount, created_at,
      shipping_address,
      order_items (
        id, quantity, unit_price,
        product:products ( id, name, images, slug )
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!order) notFound()

  const addr = order.shipping_address as Record<string, string> | null

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <Link
        href="/commandes"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-slate-500)] hover:text-[var(--color-navy-900)] transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" /> Mes commandes
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-navy-900)]">Commande #{order.order_number}</h1>
          <p className="text-sm text-[var(--color-slate-500)] mt-0.5">
            Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Badge variant={STATUS_VARIANTS[order.status] ?? 'default'}>
          {STATUS_LABELS[order.status] ?? order.status}
        </Badge>
      </div>

      <div className="flex flex-col gap-6">
        {/* Articles */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[var(--color-slate-400)]" />
              <p className="font-semibold text-[var(--color-navy-900)]">Articles commandés</p>
            </div>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            {(order.order_items as any[]).map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-slate-100)]">
                  {item.product?.images?.[0] && (
                    <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="64px" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-navy-900)] line-clamp-1">{item.product?.name}</p>
                  <p className="text-sm text-[var(--color-slate-500)]">Qté : {item.quantity}</p>
                </div>
                <p className="font-semibold text-[var(--color-navy-900)] shrink-0">{formatPrice(item.unit_price * item.quantity)}</p>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Récapitulatif */}
        <Card>
          <CardHeader><p className="font-semibold text-[var(--color-navy-900)]">Récapitulatif</p></CardHeader>
          <CardBody className="flex flex-col gap-2">
            <div className="flex justify-between text-sm text-[var(--color-slate-600)]">
              <span>Sous-total</span><span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-[var(--color-slate-600)]">
              <span>Livraison</span><span>{order.shipping_amount > 0 ? formatPrice(order.shipping_amount) : 'Gratuite'}</span>
            </div>
            <div className="flex justify-between font-bold text-[var(--color-navy-900)] pt-2 border-t border-[var(--color-slate-200)] mt-1">
              <span>Total</span><span>{formatPrice(order.total_amount)}</span>
            </div>
          </CardBody>
        </Card>

        {/* Adresse */}
        {addr && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--color-slate-400)]" />
                <p className="font-semibold text-[var(--color-navy-900)]">Adresse de livraison</p>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-[var(--color-slate-700)]">
                {addr.full_name}<br />
                {addr.address_line1}<br />
                {addr.address_line2 && <>{addr.address_line2}<br /></>}
                {addr.city}{addr.region ? `, ${addr.region}` : ''}<br />
                {addr.country} {addr.postal_code}<br />
                {addr.phone}
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  )
}
