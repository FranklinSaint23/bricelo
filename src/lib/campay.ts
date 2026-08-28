/**
 * Module d'intégration CamPay via Collect USSD Push Direct (exactement comme njangimarket)
 */

const CAMPAY_ENV = process.env.CAMPAY_ENV || process.env.CAMPAY_ENVIRONMENT || 'PROD'
const BASE_URL = CAMPAY_ENV === 'DEMO' ? 'https://demo.campay.net/api' : 'https://www.campay.net/api'

export async function getCampayToken(): Promise<string> {
  const username = process.env.CAMPAY_USERNAME || process.env.CAMPAY_APP_USERNAME || process.env.CAMPAY_API_KEY
  const password = process.env.CAMPAY_PASSWORD || process.env.CAMPAY_APP_PASSWORD || process.env.CAMPAY_API_SECRET

  if (!username || !password || username === 'placeholder' || password === 'placeholder') {
    throw new Error('Clés API CamPay non configurées. Veuillez renseigner CAMPAY_USERNAME et CAMPAY_PASSWORD dans votre fichier .env.local.')
  }

  try {
    const res = await fetch(`${BASE_URL}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      cache: 'no-store',
    })

    const data = await res.json()
    if (!res.ok || !data.token) {
      const errorMsg = data.detail || data.message || data.error || (typeof data === 'string' ? data : JSON.stringify(data))
      console.error('[CamPay Token Failure]:', errorMsg)
      throw new Error(`Échec d’authentification CamPay (${res.status}) : ${errorMsg}`)
    }

    return data.token
  } catch (err: any) {
    console.error('[CamPay getCampayToken error]:', err)
    throw new Error(err.message || 'Erreur lors de l’authentification auprès de CamPay.')
  }
}

export async function collectPayment(params: {
  amount: number
  phone: string
  description: string
  externalReference: string
}): Promise<{ reference: string; status?: string }> {
  const token = await getCampayToken()

  // Nettoyer le numéro et ajouter l'indicatif 237 requis par l'API CamPay (ex: 237651465231)
  let cleanPhone = params.phone.replace(/\D/g, '')
  if (cleanPhone.length === 9 && cleanPhone.startsWith('6')) {
    cleanPhone = `237${cleanPhone}`
  }

  // En mode DEMO, CamPay déclenche le Push USSD réel sur téléphone uniquement pour les montants <= 25 FCFA (sans débit réel)
  let collectAmount = params.amount
  if (CAMPAY_ENV === 'DEMO' && collectAmount > 25) {
    console.log('[CamPay DEMO Mode]: Montant ajusté à 10 FCFA pour déclencher le Push USSD réel de démonstration.')
    collectAmount = 10
  }

  const payload = {
    amount: String(Math.round(collectAmount)),
    currency: 'XAF',
    from: cleanPhone,
    description: params.description,
    external_reference: params.externalReference,
  }

  const res = await fetch(`${BASE_URL}/collect/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  const data = await res.json()
  console.log('[CamPay /collect/ response]:', res.status, data, 'Payload:', payload)

  if (!res.ok || !data.reference) {
    const msg = data.message || data.detail || data.from || (typeof data === 'object' ? JSON.stringify(data) : String(data))
    console.error('[CamPay collect failure]:', msg, 'Payload sent:', payload)
    throw new Error(`Échec du paiement : ${msg}`)
  }

  return { reference: data.reference, status: data.status }
}

export async function checkTransactionStatus(reference: string): Promise<{ status: string; code?: string }> {
  const token = await getCampayToken()

  const res = await fetch(`${BASE_URL}/transaction/${reference}/`, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Impossible de vérifier le statut de la transaction CamPay.')
  }

  return { status: data.status, code: data.code }
}
