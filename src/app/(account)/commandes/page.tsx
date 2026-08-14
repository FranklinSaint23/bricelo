import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OrdersListView } from '@/components/account/orders-list-view'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, order_number, status, total_amount, created_at,
      order_items(count),
      preview:order_items(product:products(images))
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const ordersWithImages = (orders ?? []).map((o: any) => ({
    ...o,
    preview_images: (o.preview ?? [])
      .map((item: any) => item.product?.images?.[0])
      .filter(Boolean)
      .slice(0, 3),
  }))

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      <OrdersListView orders={ordersWithImages} />
    </div>
  )
}
