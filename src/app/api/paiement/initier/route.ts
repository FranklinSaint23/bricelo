import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { v4 as uuidv4 } from 'uuid'
import { createCampayPaymentLink } from '@/lib/campay'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié. Veuillez vous connecter.' }, { status: 401 })

    const { orderIds, amount } = await request.json()
    if (!orderIds?.length || !amount) {
      return NextResponse.json({ error: 'Données de commande invalides.' }, { status: 400 })
    }

    const transactionRef = `BRICELO-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
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
        },
      })
    }

    const cleanSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

    // 2. Initialiser le lien de paiement avec l'API officielle CamPay
    const campayRes = await createCampayPaymentLink({
      amount,
      description: `Commande BRICELO #${transactionRef.slice(-8)}`,
      externalReference: transactionRef,
      redirectUrl: `${cleanSiteUrl}/commande-confirmee`,
    })

    if (campayRes?.link) {
      return NextResponse.json({ payment_url: campayRes.link })
    }

    return NextResponse.json(
      { error: 'Erreur lors de l’initialisation du paiement CamPay.' },
      { status: 400 }
    )
  } catch (err: any) {
    console.error('[payment/initier]', err)
    return NextResponse.json({ error: err.message ?? 'Erreur lors de l’initialisation du paiement' }, { status: 500 })
  }
}
