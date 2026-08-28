/**
 * Utilitaire d'intégration API CamPay (Paiement Mobile Money Orange & MTN au Cameroun)
 */

const CAMPAY_ENV = process.env.CAMPAY_ENV || process.env.CAMPAY_ENVIRONMENT || 'PROD'
const BASE_URL = CAMPAY_ENV === 'DEMO' ? 'https://demo.campay.net/api' : 'https://www.campay.net/api'

export async function getCampayToken(): Promise<string> {
  const username = process.env.CAMPAY_USERNAME || process.env.CAMPAY_APP_USERNAME || process.env.CAMPAY_API_KEY
  const password = process.env.CAMPAY_PASSWORD || process.env.CAMPAY_APP_PASSWORD || process.env.CAMPAY_API_SECRET

  if (!username || !password) {
    throw new Error('Clés API CamPay non configurées. Veuillez renseigner CAMPAY_USERNAME et CAMPAY_PASSWORD dans votre fichier .env.local.')
  }

  const res = await fetch(`${BASE_URL}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  const data = await res.json()
  if (!res.ok || !data.token) {
    throw new Error(data.detail || data.message || 'Erreur d’authentification auprès du service CamPay.')
  }

  return data.token
}

export async function createCampayPaymentLink(params: {
  amount: number
  description: string
  externalReference: string
  redirectUrl: string
  failureRedirectUrl?: string
}): Promise<{ link: string; reference?: string }> {
  const token = await getCampayToken()

  const res = await fetch(`${BASE_URL}/get_payment_link/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: String(params.amount),
      currency: 'XAF',
      description: params.description,
      external_reference: params.externalReference,
      redirect_url: params.redirectUrl,
      failure_redirect_url: params.failureRedirectUrl || params.redirectUrl,
    }),
  })

  const data = await res.json()
  if (!res.ok || !data.link) {
    throw new Error(data.detail || data.message || 'Impossible de générer le lien de paiement CamPay.')
  }

  return { link: data.link, reference: data.reference }
}
