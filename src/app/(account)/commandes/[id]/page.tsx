import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { OrderDetailView } from '@/components/account/order-detail-view'

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

  return <OrderDetailView order={order as any} />
}
