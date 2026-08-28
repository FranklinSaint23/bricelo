import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { v4 as uuidv4 } from 'uuid'
import { collectPayment } from '@/lib/campay'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié. Veuillez vous connecter.' }, { status: 401 })

    const { orderIds, amount, phone } = await request.json()
    if (!orderIds?.length || !amount || !phone) {
      return NextResponse.json({ error: 'Données de commande ou numéro de téléphone manquants.' }, { status: 400 })
    }

    const transactionRef = `BRICELO-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`
    const adminClient = getAdminClient()

    // 1. Enregistrer une ligne de paiement en attente dans la table 'payments' pour chaque commande
    for (let i = 0; i < orderIds.length; i++) {
      const oid = orderIds[i]
      const { data: ord } = await adminClient.from('orders').select('total').eq('id', oid).single()
      const orderAmount = ord?.total ?? amount
      const ref = i === 0 ? transactionRef : `${transactionRef}-SUB-${i + 1}`

      await adminClient.from('payments').insert({
        order_id: oid,
        transaction_ref: ref,
        amount: orderAmount,
        currency: 'XAF',
        status: 'pending',
        provider: 'campay',
        metadata: {
          parent_transaction_ref: transactionRef,
          order_ids: orderIds,
          store_order_index: i,
          phone,
        },
      })
    }

    // 2. Lancer la demande de paiement USSD Push Direct via CamPay (comme njangimarket)
    const campayRes = await collectPayment({
      amount,
      phone,
      description: `BRICELO.com - Commande #${transactionRef.slice(-8)}`,
      externalReference: transactionRef,
    })

    if (campayRes?.reference) {
      // Enregistrer la référence CamPay dans les métadonnées de paiement
      await adminClient
        .from('payments')
        .update({ metadata: { parent_transaction_ref: transactionRef, order_ids: orderIds, campay_reference: campayRes.reference, phone } })
        .eq('transaction_ref', transactionRef)

      return NextResponse.json({
        success: true,
        reference: campayRes.reference,
        transactionRef,
        message: 'Demande de paiement envoyée. Veuillez saisir votre code PIN sur votre téléphone.',
      })
    }

    return NextResponse.json(
      { error: 'Erreur lors de la demande de paiement CamPay.' },
      { status: 400 }
    )
  } catch (err: any) {
    console.error('[payment/initier]', err)
    return NextResponse.json({ error: err.message ?? 'Erreur lors de l’initialisation du paiement' }, { status: 500 })
  }
}
