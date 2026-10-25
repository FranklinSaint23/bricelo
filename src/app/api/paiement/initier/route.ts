import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { v4 as uuidv4 } from 'uuid'
import { collectPayment } from '@/lib/campay'
import { getPaymentSettings } from '@/lib/settings'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié. Veuillez vous connecter.' }, { status: 401 })

    const paymentSettings = await getPaymentSettings()
    const { orderIds, amount, phone, paymentMethod } = await request.json()

    if (!orderIds?.length || !amount || !phone) {
      return NextResponse.json({ error: 'Données de commande ou numéro de téléphone manquants.' }, { status: 400 })
    }

    // Vérifier si le mode de paiement demandé est actif
    const isOrange = paymentMethod === 'orange_money' || phone.startsWith('69') || phone.startsWith('655') || phone.startsWith('656') || phone.startsWith('657') || phone.startsWith('658') || phone.startsWith('659')
    const isMtn = paymentMethod === 'mtn_momo' || phone.startsWith('67') || phone.startsWith('68') || phone.startsWith('650') || phone.startsWith('651') || phone.startsWith('652') || phone.startsWith('653') || phone.startsWith('654')

    if (isOrange && !paymentSettings.orange_money) {
      return NextResponse.json({ error: `Orange Money : ${paymentSettings.notice_message || 'Paiement indisponible pour le moment'}` }, { status: 400 })
    }
    if (isMtn && !paymentSettings.mtn_momo) {
      return NextResponse.json({ error: `MTN Mobile Money : ${paymentSettings.notice_message || 'Paiement indisponible pour le moment'}` }, { status: 400 })
    }
    if (!paymentSettings.orange_money && !paymentSettings.mtn_momo) {
      return NextResponse.json({ error: paymentSettings.notice_message || 'Paiement indisponible pour le moment' }, { status: 400 })
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
