import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

    // Enregistrement du paiement en attente
    await supabase.from('payments').insert({
      order_id: orderIds[0],
      transaction_ref: transactionRef,
      amount,
      currency: 'XAF',
      status: 'pending',
      provider: 'cinetpay',
      metadata: { order_ids: orderIds },
    })

    // Initialisation CinetPay
    const cinetpayRes = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey:           process.env.CINETPAY_API_KEY,
        site_id:          process.env.CINETPAY_SITE_ID,
        transaction_id:   transactionRef,
        amount,
        currency:         'XAF',
        description:      `Commande BRICELO — ${orderIds.length} boutique(s)`,
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
