import { type NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { decrementStockForOrder } from '@/lib/stock'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // CamPay Webhook fields: external_reference (notre transactionRef), status ("SUCCESSFUL" / "FAILED"), reference
    const transactionRef = body.external_reference || body.cpm_trans_id || body.reference
    const statusStr = String(body.status || body.cpm_trans_status || body.cpm_result || '').toUpperCase()

    if (!transactionRef) {
      return NextResponse.json({ error: 'transaction_ref manquant' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // 1. Vérification idempotente
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, status, order_id, metadata')
      .or(`transaction_ref.eq.${transactionRef},metadata->>parent_transaction_ref.eq.${transactionRef}`)
      .maybeSingle()

    if (!existingPayment) {
      return NextResponse.json({ error: 'Transaction introuvable' }, { status: 404 })
    }

    if (existingPayment.status !== 'pending') {
      return NextResponse.json({ message: 'Déjà traité' }, { status: 200 })
    }

    const isSuccess = statusStr === 'SUCCESSFUL' || statusStr === 'SUCCESS' || statusStr === '00' || statusStr === 'ACCEPTED'
    const newStatus = isSuccess ? 'success' : 'failed'

    // 2. Mise à jour de tous les enregistrements de paiement associés
    await supabase
      .from('payments')
      .update({ status: newStatus, metadata: { ...((existingPayment.metadata as any) ?? {}), webhook_body: body } })
      .or(`transaction_ref.eq.${transactionRef},metadata->>parent_transaction_ref.eq.${transactionRef}`)

    // 3. Mise à jour des commandes associées et décrémentation des stocks
    const orderIds: string[] = (existingPayment.metadata as any)?.order_ids ?? [existingPayment.order_id]
    if (isSuccess && orderIds.length > 0) {
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
