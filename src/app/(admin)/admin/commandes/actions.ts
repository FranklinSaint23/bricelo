'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export async function validateCashOrder(orderId: string) {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) return { error: 'Non autorisé' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('orders')
    .update({ status: 'confirmed' })
    .eq('id', orderId)
    .eq('payment_method', 'cash')
    .eq('status', 'pending')

  if (error) return { error: error.message }

  revalidatePath('/admin/commandes')
  return { success: true }
}
