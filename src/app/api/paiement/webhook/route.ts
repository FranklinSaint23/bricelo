import { type NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { decrementStockForOrder } from '@/lib/stock'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cpm_trans_id, cpm_result, cpm_trans_status } = body

    if (!cpm_trans_id) {
      return NextResponse.json({ error: 'transaction_id manquant' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // 1. Vérification idempotente
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, status, order_id, metadata')
      .eq('transaction_ref', cpm_trans_id)
      .single()

    if (!existingPayment) {
      return NextResponse.json({ error: 'Transaction introuvable' }, { status: 404 })
    }

    if (existingPayment.status !== 'pending') {
      return NextResponse.json({ message: 'Déjà traité' }, { status: 200 })
    }

    const isSuccess = cpm_result === '00' || cpm_trans_status === 'ACCEPTED'
    const newStatus = isSuccess ? 'success' : 'failed'

    // 2. Mise à jour de tous les enregistrements de paiement associés (principal + sous-commandes)
    await supabase
      .from('payments')
      .update({ status: newStatus, metadata: { ...((existingPayment.metadata as any) ?? {}), webhook_body: body } })
      .or(`transaction_ref.eq.${cpm_trans_id},metadata->>parent_transaction_ref.eq.${cpm_trans_id}`)

    // 3. Mise à jour des commandes associées et décrémentation des stocks
    const orderIds: string[] = (existingPayment.metadata as any)?.order_ids ?? [existingPayment.order_id]
    if (isSuccess) {
      await supabase
        .from('orders')
        .update({ status: 'confirmed' })
        .in('id', orderIds)

      for (const oid of orderIds) {
        await decrementStockForOrder(oid)
      }
    }

    return NextResponse.json({ message: 'OK' })
  } catch (err: any) {
    console.error('[webhook/paiement]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
