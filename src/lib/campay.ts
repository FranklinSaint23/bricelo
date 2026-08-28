/**
 * Utilitaire d'intégration API CamPay (Paiement Mobile Money Orange & MTN au Cameroun)
 */

const CAMPAY_ENV = process.env.CAMPAY_ENV || process.env.CAMPAY_ENVIRONMENT || 'PROD'
const BASE_URL = CAMPAY_ENV === 'DEMO' ? 'https://demo.campay.net/api' : 'https://www.campay.net/api'

export async function getCampayToken(): Promise<string> {
  const username = process.env.CAMPAY_USERNAME || process.env.CAMPAY_APP_USERNAME || process.env.CAMPAY_API_KEY
  const password = process.env.CAMPAY_PASSWORD || process.env.CAMPAY_APP_PASSWORD || process.env.CAMPAY_API_SECRET

  if (!username || !password || username === 'placeholder' || password === 'placeholder') {
    throw new Error('Clés API CamPay non configurées dans le fichier .env.local (CAMPAY_USERNAME et CAMPAY_PASSWORD requis).')
  }

  try {
    const res = await fetch(`${BASE_URL}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
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

function ensureHttpsUrl(url: string): string {
  const configuredSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://bricelo.com').replace(/\/$/, '')
  const fallbackUrl = `${configuredSiteUrl}/commande-confirmee`

  if (!url) return fallbackUrl
  let clean = url.trim()

  // CamPay's Django API strictly validates HTTPS and rejects localhost / 127.0.0.1
  if (clean.includes('localhost') || clean.includes('127.0.0.1')) {
    if (configuredSiteUrl.includes('localhost') || configuredSiteUrl.includes('127.0.0.1')) {
      return 'https://bricelo.com/commande-confirmee'
    }
    return `${configuredSiteUrl}/commande-confirmee`
  }

  if (clean.startsWith('http://')) {
    clean = clean.replace('http://', 'https://')
  }

  if (!clean.startsWith('https://')) {
    clean = `https://${clean}`
  }

  return clean
}

export async function createCampayPaymentLink(params: {
  amount: number
  description: string
  externalReference: string
  redirectUrl: string
  failureRedirectUrl?: string
}): Promise<{ link: string; reference?: string }> {
  const token = await getCampayToken()

  const validRedirectUrl = ensureHttpsUrl(params.redirectUrl)

  const payload: Record<string, any> = {
    amount: String(params.amount),
    currency: 'XAF',
    description: params.description,
    external_reference: params.externalReference,
    redirect_url: validRedirectUrl,
  }

  if (params.failureRedirectUrl && params.failureRedirectUrl !== params.redirectUrl) {
    payload.failure_redirect_url = ensureHttpsUrl(params.failureRedirectUrl)
  }

  const res = await fetch(`${BASE_URL}/get_payment_link/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()
  if (!res.ok || !data.link) {
    const errorDetails = data.detail || data.message || data.redirect_url || data.failure_redirect_url || (typeof data === 'object' ? JSON.stringify(data) : String(data))
    console.error('[CamPay get_payment_link failure]:', errorDetails, 'Sent payload:', payload)
    throw new Error(`Erreur CamPay (${res.status}) : ${errorDetails}`)
  }

  return { link: data.link, reference: data.reference }
}
