'use server'

import { getAdminClient } from '@/lib/supabase/admin'

export type OrderNotificationData = {
  orderId: string
  customerName: string
  customerPhone: string
  city: string
  storeName: string
  totalAmount: number
  paymentMethod: string
  itemsCount: number
}

export async function buildAdminWhatsAppLink(data: OrderNotificationData): Promise<string> {
  const adminPhone = '237652704218'
  const payLabel = data.paymentMethod === 'cash' ? 'Paiement à la livraison (Cash)' : 'Paiement en ligne (Mobile Money / CinetPay)'

  const text = `📦 *NOUVELLE COMMANDE BRICELO !*

• *N° Commande :* #${data.orderId.slice(0, 8).toUpperCase()}
• *Client :* ${data.customerName} (${data.customerPhone})
• *Ville :* ${data.city}
• *Boutique :* ${data.storeName}
• *Articles :* ${data.itemsCount} article(s)
• *Montant Total :* ${data.totalAmount.toLocaleString('fr-FR')} FCFA
• *Paiement :* ${payLabel}

🔗 *Gérer sur l'Admin :* ${process.env.NEXT_PUBLIC_SITE_URL || 'https://bricelo.cm'}/admin/commandes`

  return `https://wa.me/${adminPhone}?text=${encodeURIComponent(text)}`
}

export async function logAdminNotification(data: OrderNotificationData) {
  try {
    const adminClient = getAdminClient()
    await adminClient.from('notifications').insert({
      title: `📦 Nouvelle commande #${data.orderId.slice(0, 8).toUpperCase()}`,
      content: `Client: ${data.customerName} (${data.customerPhone}) - Montant: ${data.totalAmount} FCFA - Boutique: ${data.storeName}`,
      is_read: false,
      metadata: data,
    })
  } catch (err) {
    console.error('[notifications] Erreur insertion notification DB:', err)
  }
}

export async function sendOrderNotificationEmail(data: OrderNotificationData) {
  try {
    await logAdminNotification(data)

    const adminEmail = 'bricelo237@gmail.com'
    const payLabel = data.paymentMethod === 'cash' ? 'Paiement à la livraison (Espèces)' : 'Paiement en ligne (Mobile Money)'

    console.log(`[Notification Email BRICELO] Traitement pour la commande #${data.orderId.slice(0, 8).toUpperCase()}`)

    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'placeholder') {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'BRICELO Marketplace <onboarding@resend.dev>',
          to: [adminEmail],
          subject: `📦 [BRICELO] Nouvelle commande #${data.orderId.slice(0, 8).toUpperCase()} - ${data.totalAmount.toLocaleString('fr-FR')} FCFA`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #f59e0b;">📦 Nouvelle commande reçue sur BRICELO !</h2>
              <p><strong>N° Commande :</strong> #${data.orderId.slice(0, 8).toUpperCase()}</p>
              <p><strong>Client :</strong> ${data.customerName} (${data.customerPhone})</p>
              <p><strong>Ville :</strong> ${data.city}</p>
              <p><strong>Boutique Vendeur :</strong> ${data.storeName}</p>
              <p><strong>Nombre d'articles :</strong> ${data.itemsCount}</p>
              <p><strong>Montant Total :</strong> <span style="font-size: 18px; font-weight: bold; color: #059669;">${data.totalAmount.toLocaleString('fr-FR')} FCFA</span></p>
              <p><strong>Mode de paiement :</strong> ${payLabel}</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://bricelo.cm'}/admin/commandes" style="background-color: #0f172a; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">Accéder au tableau de bord Admin</a></p>
            </div>
          `,
        }),
      })

      const resData = await res.json()
      console.log('[Resend API Result]:', resData)
    } else {
      console.log('[Resend API] Clé RESEND_API_KEY absente ou égale à placeholder dans .env.local')
    }
  } catch (err) {
    console.error('[sendOrderNotificationEmail] Erreur:', err)
  }
}
