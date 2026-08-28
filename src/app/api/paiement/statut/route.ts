import { type NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { checkTransactionStatus } from '@/lib/campay'
import { decrementStockForOrder } from '@/lib/stock'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')
    const transactionRef = searchParams.get('transactionRef')

    if (!reference && !transactionRef) {
      return NextResponse.json({ error: 'Référence manquante.' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // 1. Récupérer le paiement dans la DB
    let query = supabase.from('payments').select('id, status, order_id, metadata, transaction_ref')
    if (reference) {
      query = query.eq('metadata->>campay_reference', reference)
    } else if (transactionRef) {
      query = query.eq('transaction_ref', transactionRef)
    }

    const { data: payment } = await query.maybeSingle()

    if (!payment) {
      return NextResponse.json({ error: 'Transaction introuvable.' }, { status: 404 })
    }

    if (payment.status === 'success') {
      const orderIds: string[] = (payment.metadata as any)?.order_ids ?? [payment.order_id]
      return NextResponse.json({ status: 'SUCCESSFUL', orderIds })
    }

    // 2. Si le paiement est en attente, interroger l'API CamPay direct
    const campayRef = reference || (payment.metadata as any)?.campay_reference
    if (campayRef) {
      const campayData = await checkTransactionStatus(campayRef)
      const status = campayData.status
      console.log('[CamPay transaction status check]:', campayRef, '->', status, campayData)

      if (status === 'SUCCESSFUL' && payment.status !== 'success') {
        const orderIds: string[] = (payment.metadata as any)?.order_ids ?? [payment.order_id]

        await supabase
          .from('payments')
          .update({ status: 'success' })
          .or(`transaction_ref.eq.${payment.transaction_ref},metadata->>parent_transaction_ref.eq.${payment.transaction_ref}`)

        await supabase
          .from('orders')
          .update({ status: 'confirmed' })
          .in('id', orderIds)

        for (const oid of orderIds) {
          await decrementStockForOrder(oid)
        }

        return NextResponse.json({ status: 'SUCCESSFUL', orderIds })
      }

      if (status === 'FAILED') {
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('transaction_ref', payment.transaction_ref)

        return NextResponse.json({ status: 'FAILED' })
      }

      return NextResponse.json({ status: status || 'PENDING' })
    }

    return NextResponse.json({ status: payment.status })
  } catch (err: any) {
    console.error('[payment/statut]', err)
    return NextResponse.json({ error: err.message ?? 'Erreur lors de la vérification' }, { status: 500 })
  }
}
