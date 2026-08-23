'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function deleteUserOrder(orderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }

  const adminClient = getAdminClient()

  // 1. Supprimer les articles de la commande (order_items)
  await adminClient.from('order_items').delete().eq('order_id', orderId)

  // 2. Supprimer les paiements associés (payments)
  await adminClient.from('payments').delete().eq('order_id', orderId)

  // 3. Supprimer la commande (orders)
  const { error } = await adminClient
    .from('orders')
    .delete()
    .eq('id', orderId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/commandes')
  return { success: true }
}
