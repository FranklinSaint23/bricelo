'use client'

import { useState } from 'react'
import { PaymentSettings } from '@/lib/settings'
import { updatePaymentSettingsAction } from '@/app/(admin)/admin/paiements/actions'
import { ShieldAlert, CheckCircle2, AlertCircle, Loader2, CreditCard, Lock, Unlock } from 'lucide-react'

interface Props {
  initialSettings: PaymentSettings
}

export function PaymentSettingsControl({ initialSettings }: Props) {
  const [orangeMoney, setOrangeMoney] = useState(initialSettings.orange_money)
  const [mtnMomo, setMtnMomo] = useState(initialSettings.mtn_momo)
  const [noticeMessage, setNoticeMessage] = useState(initialSettings.notice_message || 'Paiement indisponible pour le moment')
  
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSave() {
    setLoading(true)
    setSuccessMsg(null)
    setErrorMsg(null)

    const res = await updatePaymentSettingsAction({
      orange_money: orangeMoney,
      mtn_momo: mtnMomo,
      notice_message: noticeMessage,
    })

    setLoading(false)

    if (res.error) {
      setErrorMsg(res.error)
    } else {
      setSuccessMsg('Paramètres de paiement enregistrés avec succès !')
      setTimeout(() => setSuccessMsg(null), 4000)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-slate-200)] p-5 sm:p-6 mb-8 shadow-xs">
      <div className="flex items-start justify-between flex-wrap gap-4 pb-4 border-b border-[var(--color-slate-100)]">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[var(--color-accent)]" />
            <h2 className="text-base sm:text-lg font-bold text-[var(--color-navy-900)]">
              Gestion des Paiements en Ligne
            </h2>
          </div>
          <p className="text-xs text-[var(--color-slate-500)] mt-1">
            Activez ou désactivez manuellement les paiements Mobile Money. Si désactivés, l'option sera grisée à la caisse avec le message de votre choix.
          </p>
        </div>

        {(!orangeMoney && !mtnMomo) ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
            <Lock className="h-3.5 w-3.5" /> Tous les paiements en ligne désactivés
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
            <Unlock className="h-3.5 w-3.5" /> Paiements en ligne partiellement ou totalement actifs
          </span>
        )}
      </div>

      {successMsg && (
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
        {/* Toggle Orange Money */}
        <div className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
          orangeMoney ? 'bg-orange-50/60 border-orange-300' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-black border border-orange-500/50 p-1 flex items-center justify-center shrink-0">
              <img src="/payments/orange.jpg" alt="Orange Money" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--color-navy-900)]">Orange Money</p>
              <p className="text-[11px] text-[var(--color-slate-500)]">
                {orangeMoney ? 'Actif - Disponible au paiement' : 'Désactivé - Non disponible'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOrangeMoney(!orangeMoney)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              orangeMoney ? 'bg-orange-600' : 'bg-slate-300'
            }`}
            role="switch"
            aria-checked={orangeMoney}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                orangeMoney ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle MTN Mobile Money */}
        <div className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
          mtnMomo ? 'bg-amber-50/60 border-amber-300' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-400 border border-amber-500/50 p-1 flex items-center justify-center shrink-0">
              <img src="/payments/mtn-momo.png" alt="MTN Mobile Money" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--color-navy-900)]">MTN Mobile Money</p>
              <p className="text-[11px] text-[var(--color-slate-500)]">
                {mtnMomo ? 'Actif - Disponible au paiement' : 'Désactivé - Non disponible'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMtnMomo(!mtnMomo)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              mtnMomo ? 'bg-amber-600' : 'bg-slate-300'
            }`}
            role="switch"
            aria-checked={mtnMomo}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                mtnMomo ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Message de notification quand désactivé */}
      <div className="mt-5 pt-4 border-t border-[var(--color-slate-100)] flex flex-col gap-2">
        <label className="text-xs font-bold text-[var(--color-navy-900)] flex items-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Message affiché au client en cas d'indisponibilité</span>
        </label>
        <input
          type="text"
          value={noticeMessage}
          onChange={(e) => setNoticeMessage(e.target.value)}
          placeholder="Paiement indisponible pour le moment"
          className="h-10 px-3.5 text-xs sm:text-sm border border-[var(--color-slate-300)] rounded-xl bg-white text-[var(--color-navy-900)] focus:outline-none focus:border-[var(--color-navy-900)]"
        />
        <p className="text-[11px] text-[var(--color-slate-400)]">
          Ce message apparaîtra directement sous l'option de paiement si celle-ci est désactivée.
        </p>
      </div>

      {/* Bouton de sauvegarde */}
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="h-10 px-5 bg-[var(--color-navy-900)] hover:bg-[var(--color-navy-950)] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{loading ? 'Enregistrement...' : 'Enregistrer la configuration'}</span>
        </button>
      </div>
    </div>
  )
}
