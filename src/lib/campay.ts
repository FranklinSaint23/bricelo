/**
 * Module d'intégration CamPay Production via Collect USSD Push Direct
 */

function getCampayBaseUrl(): string {
  const env = (process.env.CAMPAY_ENV || process.env.CAMPAY_ENVIRONMENT || 'PROD').trim().toUpperCase()
  return env === 'DEMO'
    ? 'https://demo.campay.net/api'
    : 'https://www.campay.net/api'
}

export async function getCampayToken(): Promise<string> {
  const baseUrl = getCampayBaseUrl()
  const username = (process.env.CAMPAY_USERNAME || process.env.CAMPAY_APP_USERNAME || process.env.CAMPAY_API_KEY || '').trim()
  const password = (process.env.CAMPAY_PASSWORD || process.env.CAMPAY_APP_PASSWORD || process.env.CAMPAY_API_SECRET || '').trim()

  if (!username || !password || username === 'placeholder' || password === 'placeholder') {
    throw new Error('Clés API CamPay non configurées. Veuillez renseigner CAMPAY_USERNAME et CAMPAY_PASSWORD dans votre fichier .env.local.')
  }

  try {
    const res = await fetch(`${baseUrl}/token/`, {
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

  // Formatage international requis par CamPay : 237 + 9 chiffres (ex: 2376XXXXXXXX)
  let cleanPhone = params.phone.replace(/\D/g, '')
  if (cleanPhone.length === 9 && cleanPhone.startsWith('6')) {
    cleanPhone = `237${cleanPhone}`
  }

  const baseUrl = getCampayBaseUrl()

  const payload = {
    amount: String(Math.round(params.amount)),
    currency: 'XAF',
    from: cleanPhone,
    description: params.description,
    external_reference: params.externalReference,
  }

  const res = await fetch(`${baseUrl}/collect/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  const data = await res.json()

  if (!res.ok || !data.reference) {
    const msg = data.message || data.detail || data.from || (typeof data === 'object' ? JSON.stringify(data) : String(data))
    console.error('[CamPay collect failure]:', msg, 'Payload sent:', payload)
    throw new Error(`Échec du paiement : ${msg}`)
  }

  return { reference: data.reference, status: data.status }
}

export async function checkTransactionStatus(reference: string): Promise<{ status: string; code?: string }> {
  const token = await getCampayToken()
  const baseUrl = getCampayBaseUrl()

  const res = await fetch(`${baseUrl}/transaction/${reference}/`, {
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
