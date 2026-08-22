import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { orderIds, amount } = await request.json()
    if (!orderIds?.length || !amount) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const transactionRef = `BRICELO-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const adminClient = getAdminClient()

    // 1. Créer une ligne de paiement dans 'payments' pour chaque sous-commande boutique
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
        provider: 'cinetpay',
        metadata: {
          parent_transaction_ref: transactionRef,
          order_ids: orderIds,
          store_order_index: i,
        },
      })
    }

    // 2. Initialisation CinetPay avec la référence principale
    const cinetpayRes = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey:           process.env.CINETPAY_API_KEY,
        site_id:          process.env.CINETPAY_SITE_ID,
        transaction_id:   transactionRef,
        amount,
        currency:         'XAF',
        description:      `Commande BRICELO - ${orderIds.length} boutique(s)`,
        notify_url:       `${siteUrl}/api/paiement/webhook`,
        return_url:       `${siteUrl}/commandes?paiement=success`,
        channels:         'ALL',
        lang:             'fr',
        customer_id:      user.id,
        customer_email:   user.email,
      }),
    })

    const cinetpayData = await cinetpayRes.json()
    if (cinetpayData.code !== '201') {
      throw new Error(cinetpayData.message ?? 'Erreur CinetPay')
    }

    return NextResponse.json({ payment_url: cinetpayData.data.payment_url })
  } catch (err: any) {
    console.error('[payment/initier]', err)
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
