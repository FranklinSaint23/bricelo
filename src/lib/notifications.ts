'use server'

import { getAdminClient } from '@/lib/supabase/admin'

export type OrderNotificationItem = {
  name: string
  variantName?: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
}

export type OrderNotificationData = {
  orderId: string
  createdAt?: string
  customerName: string
  customerEmail?: string | null
  customerPhone: string
  city: string
  addressLine: string
  storeName: string
  storePhone?: string | null
  totalAmount: number
  subtotal: number
  shippingCost: number
  paymentMethod: string
  itemsCount: number
  items: OrderNotificationItem[]
}

/**
 * Construit le lien WhatsApp pré-rempli à destination du Vendeur spécifique
 * Contient TOUS les détails de la commande (Date, Heure, Articles, Montant, Lieu de livraison)
 * SANS le numéro de téléphone du client.
 */
export async function buildVendorWhatsAppLink(data: OrderNotificationData): Promise<string> {
  const rawPhone = (data.storePhone || '237652704218').replace(/\D/g, '')
  const vendorPhone = rawPhone.startsWith('237') ? rawPhone : `237${rawPhone}`
  const payLabel = data.paymentMethod === 'cash' ? 'Paiement à la livraison (Espèces)' : 'Paiement en ligne (Mobile Money)'
  const dateStr = data.createdAt || new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' })

  const itemsText = (data.items || []).map(i => `  • ${i.name}${i.variantName ? ` [${i.variantName}]` : ''} x${i.quantity} — ${i.totalPrice.toLocaleString('fr-FR')} FCFA`).join('\n')

  const text = `📦 *RAMASSAGE COMMANDE BRICELO !*

• *N° Commande :* #${data.orderId.slice(0, 8).toUpperCase()}
• *Date & Heure :* ${dateStr}
• *Boutique Vendeur :* ${data.storeName}
• *Ville de livraison :* ${data.city}
• *Lieu / Adresse :* ${data.addressLine || 'Centre-ville'}
• *Mode de Paiement :* ${payLabel}

📋 *ARTICLES À PRÉPARER EN BOUTIQUE :*
${itemsText || `  • ${data.itemsCount} article(s)`}

💰 *MONTANT TOTAL :* ${data.totalAmount.toLocaleString('fr-FR')} FCFA

🚛 *Un livreur BRICELO va passer en boutique récupérer le colis pour livraison.*`

  return `https://wa.me/${vendorPhone}?text=${encodeURIComponent(text)}`
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

/**
 * Envoie la notification SMS au client via l'API Twilio (ou log de secours)
 */
export async function sendCustomerSMSNotification(phone: string, text: string) {
  console.log(`[SMS Notification BRICELO] Traitement SMS pour ${phone} : "${text}"`)

  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (!sid || !token || !fromNumber || sid === 'placeholder') {
    console.log('[SMS Notification BRICELO] Twilio non configuré dans .env.local (ajouter TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN et TWILIO_PHONE_NUMBER)')
    return
  }

  const rawPhone = phone.replace(/\D/g, '')
  const formattedPhone = rawPhone.startsWith('237') ? `+${rawPhone}` : `+237${rawPhone}`

  try {
    const authHeader = 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64')
    const params = new URLSearchParams()
    params.append('To', formattedPhone)
    params.append('From', fromNumber)
    params.append('Body', text)

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authHeader,
      },
      body: params.toString(),
    })

    const resData = await res.json()
    console.log('[Twilio SMS API Result]:', resData)
  } catch (err) {
    console.error('[Twilio SMS Error]:', err)
  }
}

/**
 * Envoie l'e-mail de réinitialisation de mot de passe directement via Resend API
 */
export async function sendPasswordResetEmail(email: string, redirectToUrl: string) {
  try {
    const adminClient = getAdminClient()
    const { data, error } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: { redirectTo: redirectToUrl },
    })

    if (error || !data?.properties?.action_link) {
      console.error('[sendPasswordResetEmail] Erreur génération lien Supabase:', error)
      return { error: error?.message || 'Aucun compte utilisateur trouvé avec cette adresse e-mail.' }
    }

    const resetLink = data.properties.action_link

    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'placeholder') {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'BRICELO Marketplace <onboarding@resend.dev>',
          to: [email],
          subject: '🔑 Réinitialisation de votre mot de passe BRICELO',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 12px;">
              <div style="background-color: #0f172a; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 24px;">
                <h1 style="color: #f59e0b; margin: 0; font-size: 22px;">🔑 RÉINITIALISATION DE VOTRE MOT DE PASSE</h1>
              </div>
              <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0;">
                <p style="font-size: 15px; color: #0f172a;">Bonjour,</p>
                <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                  Vous avez demandé la réinitialisation de votre mot de passe sur <strong>BRICELO</strong>. Cliquez sur le bouton ci-dessous pour choisir votre nouveau mot de passe :
                </p>
                <div style="text-align: center; margin: 28px 0;">
                  <a href="${resetLink}" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                    Réinitialiser mon mot de passe
                  </a>
                </div>
                <p style="font-size: 12px; color: #64748b;">
                  Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.
                </p>
              </div>
            </div>
          `,
        }),
      })

      const resData = await res.json()
      console.log('[Resend Password Reset Email Result]:', resData)

      if (resData.error || (resData.statusCode && resData.statusCode >= 400)) {
        const msg = resData.message || resData.name || 'Erreur Resend'
        if (msg.includes('only send to your own email address') || msg.includes('validation_error')) {
          return {
            error: `Mode Test Resend Sandbox : Resend n'autorise l'envoi d'e-mails qu'à l'adresse du propriétaire du compte Resend (${email === 'bricelo237@gmail.com' ? 'bricelo237@gmail.com' : 'bricelo237@gmail.com'}). Veuillez tester la réinitialisation avec bricelo237@gmail.com ou vérifier votre domaine sur Resend.`
          }
        }
        return { error: msg }
      }

      return { success: true }
    } else {
      return { error: 'Clé API Resend non configurée.' }
    }
  } catch (err: any) {
    console.error('[sendPasswordResetEmail] Erreur:', err)
    return { error: err.message }
  }
}

/**
 * Envoie les e-mails de notification complets :
 * 1. E-mail exhaustif pour l'Admin (avec bouton WhatsApp direct Vendeur)
 * 2. E-mail complet et détaillé ou SMS de confirmation pour le Client
 */
export async function sendOrderNotificationEmail(data: OrderNotificationData) {
  try {
    await logAdminNotification(data)

    const adminEmail = 'bricelo237@gmail.com'
    const payLabel = data.paymentMethod === 'cash' ? 'Paiement à la livraison (Espèces)' : 'Paiement en ligne (Mobile Money)'
    const dateStr = data.createdAt || new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' })
    const vendorWhatsAppUrl = await buildVendorWhatsAppLink(data)

    const itemsHtml = (data.items || []).map(i => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px; font-weight: bold; color: #0f172a;">
          ${i.name}${i.variantName ? ` <span style="font-weight: normal; color: #64748b;">(${i.variantName})</span>` : ''}
        </td>
        <td style="padding: 10px; text-align: center; color: #334155;">x${i.quantity}</td>
        <td style="padding: 10px; text-align: right; color: #334155;">${i.unitPrice.toLocaleString('fr-FR')} FCFA</td>
        <td style="padding: 10px; text-align: right; font-weight: bold; color: #0f172a;">${i.totalPrice.toLocaleString('fr-FR')} FCFA</td>
      </tr>
    `).join('')

    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'placeholder') {
      // 1. ENVOI E-MAIL EXHAUSTIF À L'ADMIN
      const resAdmin = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'BRICELO Marketplace <onboarding@resend.dev>',
          to: [adminEmail],
          subject: `📦 [BRICELO ADMIN] Nouvelle commande #${data.orderId.slice(0, 8).toUpperCase()} - ${data.totalAmount.toLocaleString('fr-FR')} FCFA`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 12px;">
              <div style="background-color: #0f172a; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 24px;">
                <h1 style="color: #f59e0b; margin: 0; font-size: 22px;">📦 NOUVELLE COMMANDE REÇUE SUR BRICELO</h1>
                <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 14px;">Commande N° #${data.orderId.slice(0, 8).toUpperCase()}</p>
              </div>

              <!-- DÉTAILS DE LA COMMANDE -->
              <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
                <h3 style="color: #0f172a; margin-top: 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">ℹ️ Informations Générales</h3>
                <p><strong>N° Commande :</strong> #${data.orderId.slice(0, 8).toUpperCase()}</p>
                <p><strong>Date & Heure :</strong> ${dateStr}</p>
                <p><strong>Mode de paiement :</strong> <span style="background-color: #fef3c7; color: #92400e; padding: 3px 8px; border-radius: 4px; font-weight: bold;">${payLabel}</span></p>
              </div>

              <!-- CLIENT ET LIVRAISON -->
              <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
                <h3 style="color: #0f172a; margin-top: 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">👤 Client & Lieu de Livraison</h3>
                <p><strong>Nom du client :</strong> ${data.customerName}</p>
                <p><strong>Téléphone client :</strong> <a href="tel:${data.customerPhone}" style="color: #0284c7; font-weight: bold;">${data.customerPhone}</a></p>
                ${data.customerEmail ? `<p><strong>E-mail client :</strong> ${data.customerEmail}</p>` : ''}
                <p><strong>Ville :</strong> ${data.city}</p>
                <p><strong>Lieu / Adresse de livraison :</strong> ${data.addressLine || 'Non spécifié'}</p>
              </div>

              <!-- BOUTIQUE VENDEUR -->
              <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
                <h3 style="color: #0f172a; margin-top: 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">🏪 Boutique Vendeur</h3>
                <p><strong>Nom de la boutique :</strong> ${data.storeName}</p>
                ${data.storePhone ? `<p><strong>Téléphone Vendeur :</strong> ${data.storePhone}</p>` : ''}
              </div>

              <!-- TABLEAU DES ARTICLES -->
              <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
                <h3 style="color: #0f172a; margin-top: 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">🛒 Contenu de la Commande</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <thead>
                    <tr style="background-color: #f1f5f9; text-align: left;">
                      <th style="padding: 8px;">Article</th>
                      <th style="padding: 8px; text-align: center;">Qté</th>
                      <th style="padding: 8px; text-align: right;">P.U</th>
                      <th style="padding: 8px; text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>

                <div style="margin-top: 16px; text-align: right; font-size: 14px;">
                  <p style="margin: 4px 0;">Sous-total : <strong>${data.subtotal.toLocaleString('fr-FR')} FCFA</strong></p>
                  <p style="margin: 4px 0;">Livraison fixe : <strong>${data.shippingCost.toLocaleString('fr-FR')} FCFA</strong></p>
                  <p style="margin: 8px 0 0 0; font-size: 18px; color: #059669; font-weight: bold;">TOTAL : ${data.totalAmount.toLocaleString('fr-FR')} FCFA</p>
                </div>
              </div>

              <!-- BOUTON TRANSMISSION WHATSAPP AU VENDEUR -->
              <div style="text-align: center; margin: 28px 0 16px 0;">
                <a href="${vendorWhatsAppUrl}" target="_blank" style="background-color: #25D366; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(37,211,102,0.3);">
                  📲 Transmettre la commande au Vendeur (${data.storeName}) sur WhatsApp
                </a>
                <p style="color: #64748b; font-size: 12px; margin-top: 8px;">
                  Ce bouton pré-remplit les détails de la commande pour le vendeur (sans le numéro du client).
                </p>
              </div>

              <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8;">
                © BRICELO Marketplace Admin System
              </div>
            </div>
          `,
        }),
      })

      const resAdminData = await resAdmin.json()
      console.log('[Resend Admin Email Result]:', resAdminData)

      // 2. ENVOI DE LA CONFIRMATION CLIENT (E-MAIL DÉTAILLÉ OU SMS)
      const hasRealEmail = data.customerEmail && !data.customerEmail.includes('@bricelo.phone')

      if (hasRealEmail) {
        // Envoi E-mail de confirmation très détaillé au client
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'BRICELO Marketplace <onboarding@resend.dev>',
            to: [data.customerEmail!],
            subject: `🎉 Confirmation de votre commande #${data.orderId.slice(0, 8).toUpperCase()} - BRICELO`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 12px;">
                <div style="background-color: #0f172a; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 24px;">
                  <h1 style="color: #f59e0b; margin: 0; font-size: 22px;">🎉 MERCI POUR VOTRE COMMANDE !</h1>
                  <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 14px;">Commande N° #${data.orderId.slice(0, 8).toUpperCase()}</p>
                </div>

                <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
                  <p style="font-size: 15px; color: #0f172a; margin-top: 0;">Bonjour <strong>${data.customerName}</strong>,</p>
                  <p style="font-size: 14px; color: #334155; line-height: 1.5;">
                    Nous avons bien enregistré votre commande. Un agent de livraison BRICELO vous contactera très rapidement pour planifier votre livraison.
                  </p>
                </div>

                <!-- TABLEAU DÉTAILLÉ POUR LE CLIENT -->
                <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
                  <h3 style="color: #0f172a; margin-top: 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">🛒 Récapitulatif des Articles</h3>
                  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead>
                      <tr style="background-color: #f1f5f9; text-align: left;">
                        <th style="padding: 8px;">Article</th>
                        <th style="padding: 8px; text-align: center;">Qté</th>
                        <th style="padding: 8px; text-align: right;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${(data.items || []).map(i => `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                          <td style="padding: 10px; font-weight: bold; color: #0f172a;">${i.name}${i.variantName ? ` (${i.variantName})` : ''}</td>
                          <td style="padding: 10px; text-align: center; color: #334155;">x${i.quantity}</td>
                          <td style="padding: 10px; text-align: right; font-weight: bold; color: #0f172a;">${i.totalPrice.toLocaleString('fr-FR')} FCFA</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>

                  <div style="margin-top: 16px; text-align: right; font-size: 14px;">
                    <p style="margin: 4px 0;">Livraison fixe : <strong>${data.shippingCost.toLocaleString('fr-FR')} FCFA</strong></p>
                    <p style="margin: 8px 0 0 0; font-size: 18px; color: #059669; font-weight: bold;">TOTAL PAYÉ / À PAYER : ${data.totalAmount.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                </div>

                <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0;">
                  <h3 style="color: #0f172a; margin-top: 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">📍 Lieu de livraison</h3>
                  <p style="margin: 4px 0; font-size: 14px;"><strong>Ville :</strong> ${data.city}</p>
                  <p style="margin: 4px 0; font-size: 14px;"><strong>Adresse :</strong> ${data.addressLine || 'Centre-ville'}</p>
                </div>

                <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8;">
                  © BRICELO.com — Service Client
                </div>
              </div>
            `,
          }),
        })
      } else if (data.customerPhone) {
        // Envoi SMS automatique au téléphone client
        const smsText = `BRICELO: Votre commande #${data.orderId.slice(0, 8).toUpperCase()} de ${data.totalAmount.toLocaleString('fr-FR')} FCFA a ete recue. Livraison a ${data.city}. Un agent vous contactera.`
        await sendCustomerSMSNotification(data.customerPhone, smsText)
      }
    }
  } catch (err) {
    console.error('[sendOrderNotificationEmail] Erreur:', err)
  }
}

/**
 * Charge les détails complets des commandes spécifiées et déclenche l'envoi des e-mails/SMS de confirmation
 * après validation réussie d'un paiement en ligne (Orange / MTN Mobile Money).
 */
export async function sendConfirmationForOrders(supabase: any, orderIds: string[], paymentMethod: string) {
  for (const oid of orderIds) {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('id, total, subtotal, shipping_cost, shipping_address, store_id')
        .eq('id', oid)
        .maybeSingle()

      if (!order) continue

      const [{ data: storeData }, { data: itemsData }] = await Promise.all([
        supabase.from('stores').select('name, phone').eq('id', order.store_id).maybeSingle(),
        supabase.from('order_items').select('quantity, unit_price, total_price, snapshot').eq('order_id', order.id),
      ])

      const shippingAddress = (order.shipping_address as any) ?? {}
      const items = (itemsData ?? []).map((i: any) => ({
        name: i.snapshot?.name || 'Article BRICELO',
        variantName: i.snapshot?.variant_name || null,
        quantity: i.quantity,
        unitPrice: i.unit_price,
        totalPrice: i.total_price,
      }))

      await sendOrderNotificationEmail({
        orderId: order.id,
        createdAt: new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' }),
        customerName: shippingAddress.full_name || 'Client',
        customerEmail: shippingAddress.email || null,
        customerPhone: shippingAddress.phone || '',
        city: shippingAddress.city || 'Douala',
        addressLine: shippingAddress.address_line || `${shippingAddress.city || ''}`,
        storeName: storeData?.name ?? 'Boutique BRICELO',
        storePhone: storeData?.phone ?? null,
        totalAmount: order.total,
        subtotal: order.subtotal,
        shippingCost: order.shipping_cost,
        paymentMethod: paymentMethod,
        itemsCount: items.length,
        items,
      })
    } catch (e) {
      console.error('[sendConfirmationForOrders] Erreur:', e)
    }
  }
}
