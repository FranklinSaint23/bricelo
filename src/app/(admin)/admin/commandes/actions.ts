'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export async function validateCashOrder(orderId: string) {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) return { error: 'Non autorisé' }

  const supabase = await createClient()

  // 1. Récupérer la commande
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id, total, status, payment_method, store_id')
    .eq('id', orderId)
    .single()

  if (orderErr || !order) return { error: 'Commande introuvable' }

  if (order.status !== 'pending') {
    return { error: 'Cette commande est déjà traitée.' }
  }

  const adminClient = getAdminClient()

  // 2. Mettre à jour le statut de la commande à 'confirmed'
  const { error: updateErr } = await adminClient
    .from('orders')
    .update({ status: 'confirmed' })
    .eq('id', orderId)

  if (updateErr) return { error: updateErr.message }

  // 3. Enregistrer automatiquement la transaction dans la table payments
  const transactionRef = `CASH-${orderId.slice(0, 8).toUpperCase()}`

  const { data: existingPayment } = await adminClient
    .from('payments')
    .select('id')
    .eq('transaction_ref', transactionRef)
    .maybeSingle()

  if (!existingPayment) {
    const { error: payErr } = await adminClient
      .from('payments')
      .insert({
        order_id: orderId,
        transaction_ref: transactionRef,
        amount: order.total,
        currency: 'XAF',
        status: 'success',
        provider: 'cash',
        metadata: {
          validated_by: userId,
          validated_at: new Date().toISOString(),
          payment_type: 'Paiement à la livraison',
        },
      })

    if (payErr) {
      console.error('[validateCashOrder] Erreur enregistrement paiement:', payErr)
    }
  }

  revalidatePath('/admin/commandes')
  revalidatePath('/admin/paiements')
  revalidatePath('/admin')
  revalidatePath('/vendeur/commandes')
  revalidatePath('/vendeur')

  return { success: true }
}
