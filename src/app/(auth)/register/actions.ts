'use server'

import { getAdminClient } from '@/lib/supabase/admin'

export async function linkGuestOrders(userId: string, email?: string | null, phone?: string | null) {
  if (!userId) return

  const adminClient = getAdminClient()
  const cleanEmail = email?.trim().toLowerCase()
  const cleanPhone = phone?.replace(/\D/g, '')

  if (!cleanEmail && !cleanPhone) return

  // Rechercher les commandes effectuées en mode invité (sans user_id)
  const { data: unassignedOrders } = await adminClient
    .from('orders')
    .select('id, shipping_address')
    .is('user_id', null)

  if (!unassignedOrders || unassignedOrders.length === 0) return

  const matchingIds: string[] = []
  for (const order of unassignedOrders) {
    const addr = (order.shipping_address as any) ?? {}
    const orderPhone = (addr.phone ?? '').replace(/\D/g, '')
    const orderEmail = (addr.email ?? '').trim().toLowerCase()

    if (
      (cleanPhone && orderPhone && (orderPhone.endsWith(cleanPhone.slice(-8)) || cleanPhone.endsWith(orderPhone.slice(-8)))) ||
      (cleanEmail && orderEmail === cleanEmail)
    ) {
      matchingIds.push(order.id)
    }
  }

  if (matchingIds.length > 0) {
    await adminClient
      .from('orders')
      .update({ user_id: userId })
      .in('id', matchingIds)
  }
}
