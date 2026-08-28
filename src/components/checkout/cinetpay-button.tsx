'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CreditCard, Smartphone, CheckCircle, Loader2, ShieldCheck } from 'lucide-react'

interface Props {
  orderIds: string[]
  amount: number
  paymentMethod?: string
}

function checkOperatorMatch(cleanPhone: string, method?: string): { isValid: boolean; errorMsg?: string } {
  const raw = cleanPhone.replace(/^237/, '')
  if (raw.length !== 9) {
    return { isValid: false, errorMsg: 'Le numéro de téléphone doit comporter exactement 9 chiffres (ex: 6XX XXX XXX).' }
  }

  const isOrange = /^6(9\d|5[5-9])\d{6}$/.test(raw)
  const isMtn = /^6(7\d|8\d|5[0-4])\d{6}$/.test(raw)

  if (method === 'mtn_momo') {
    if (!isMtn) {
      if (isOrange) {
        return { isValid: false, errorMsg: 'Attention : Vous avez choisi le paiement MTN Mobile Money, mais ce numéro (69X / 655-659) appartient au réseau Orange. Veuillez saisir un numéro MTN.' }
      }
      return { isValid: false, errorMsg: 'Numéro non conforme au réseau MTN Mobile Money (ex: 67X XXX XXX, 68X, 650-654).' }
    }
  } else if (method === 'orange_money') {
    if (!isOrange) {
      if (isMtn) {
        return { isValid: false, errorMsg: 'Attention : Vous avez choisi le paiement Orange Money, mais ce numéro (67X / 650-654) appartient au réseau MTN. Veuillez saisir un numéro Orange.' }
      }
      return { isValid: false, errorMsg: 'Numéro non conforme au réseau Orange Money (ex: 69X XXX XXX, 655-659).' }
    }
  }

  return { isValid: true }
}

export function CamPayButton({ orderIds, amount, paymentMethod }: Props) {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [waitingPin, setWaitingPin] = useState(false)
  const [paymentRef, setPaymentRef] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null)

  const isMtnMode = paymentMethod === 'mtn_momo'
  const isOrangeMode = paymentMethod === 'orange_money'

  // Nettoyer l'intervalle au démontage
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    }
  }, [])

  async function handlePay() {
    setError(null)
    const cleanPhone = phone.replace(/\D/g, '')

    const check = checkOperatorMatch(cleanPhone, paymentMethod)
    if (!check.isValid) {
      setError(check.errorMsg || 'Numéro invalide.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/paiement/initier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds, amount, phone: cleanPhone }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Échec lors de la demande de paiement.')

      setPaymentRef(data.reference)
      setWaitingPin(true)
      setLoading(false)

      // Démarrer la vérification automatique du statut toutes les 3 secondes (comme njangimarket)
      pollTimerRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/paiement/statut?reference=${data.reference}`)
          const statusData = await statusRes.json()

          if (statusData.status === 'SUCCESSFUL') {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current)
            router.push(`/commande-confirmee?orders=${orderIds.join(',')}&paiement=success`)
          } else if (statusData.status === 'FAILED') {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current)
            setWaitingPin(false)
            setError('Paiement échoué ou annulé sur votre téléphone. Veuillez réessayer.')
          }
        } catch (e) {
          console.error('[Statut Polling Error]:', e)
        }
      }, 3000)

    } catch (err: any) {
      setError(err.message || 'Erreur de paiement.')
      setLoading(false)
      setWaitingPin(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Saisie du numéro Mobile Money */}
      {!waitingPin ? (
        <div className="flex flex-col gap-3 bg-[var(--color-slate-50)] p-4 rounded-xl border border-[var(--color-slate-200)]">
          <label className="text-xs font-bold text-[var(--color-navy-900)] flex items-center gap-1.5">
            <Smartphone className="h-4 w-4 text-[var(--color-accent)]" />
            <span>
              {isMtnMode
                ? 'Numéro MTN Mobile Money *'
                : isOrangeMode
                ? 'Numéro Orange Money *'
                : 'Numéro Mobile Money (Orange / MTN) *'}
            </span>
          </label>
          <div className="relative">
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={
                isMtnMode
                  ? 'Ex: 670000000 ou 677000000'
                  : isOrangeMode
                  ? 'Ex: 699000000 ou 655000000'
                  : 'Ex: 699000000 ou 677000000'
              }
              required
              className="h-11 px-3.5 text-sm font-bold border border-[var(--color-slate-300)] rounded-[var(--radius-lg)] bg-white text-[var(--color-navy-900)]"
            />
          </div>
          <p className="text-[11px] text-[var(--color-slate-500)] italic">
            {isMtnMode
              ? 'Seuls les numéros du réseau MTN (67X, 68X, 650-654) sont acceptés pour cette option.'
              : isOrangeMode
              ? 'Seuls les numéros du réseau Orange (69X, 655-659) sont acceptés pour cette option.'
              : 'Une demande d\'autorisation (Push USSD) sera envoyée sur votre mobile.'}
          </p>

          <Button
            onClick={handlePay}
            loading={loading}
            size="lg"
            className="w-full font-bold bg-[var(--color-accent)] hover:bg-[var(--color-gold-600)] text-[var(--color-navy-900)] py-4 shadow-md mt-1 btn-animate-attention"
          >
            <CreditCard className="h-4.5 w-4.5" />
            Payer maintenant
          </Button>
        </div>
      ) : (
        /* Écran d'attente de validation PIN USSD sur le mobile du client */
        <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col items-center text-center gap-3 animate-pulse">
          <div className="h-12 w-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md shrink-0">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <div>
            <h4 className="text-sm font-black text-amber-950">Demande envoyée sur votre téléphone !</h4>
            <p className="text-xs text-amber-800 font-medium mt-1 leading-relaxed">
              Regardez l'écran de votre mobile (numéro <strong>{phone}</strong>) et saisissez votre <strong>Code PIN secret</strong> pour valider le règlement.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold bg-white/80 px-3 py-1 rounded-full border border-amber-200">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
            <span>Vérification automatique en cours...</span>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-center text-rose-700 font-bold bg-rose-50 p-3 rounded-xl border border-rose-200">
          {error}
        </p>
      )}

      <p className="text-[11px] text-center text-[var(--color-slate-400)]">
        Paiement sécurisé crypté par CamPay (Orange Money & MTN Mobile Money).
      </p>
    </div>
  )
}

// Alias pour compatibilité
export const CinetPayButton = CamPayButton
