import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Utilise le service_role pour bypasser RLS — uniquement côté serveur
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cpm_trans_id, cpm_result, cpm_trans_status } = body

    if (!cpm_trans_id) {
      return NextResponse.json({ error: 'transaction_id manquant' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // Vérification idempotente — on ne traite pas deux fois la même transaction
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

    // Mise à jour du paiement
    await supabase
      .from('payments')
      .update({ status: newStatus, metadata: { ...((existingPayment.metadata as any) ?? {}), webhook_body: body } })
      .eq('transaction_ref', cpm_trans_id)

    // Mise à jour des commandes associées
    const orderIds: string[] = (existingPayment.metadata as any)?.order_ids ?? [existingPayment.order_id]
    if (isSuccess) {
      await supabase
        .from('orders')
        .update({ status: 'confirmed' })
        .in('id', orderIds)
    }

    return NextResponse.json({ message: 'OK' })
  } catch (err: any) {
    console.error('[webhook/paiement]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
