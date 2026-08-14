'use client'

import Image from 'next/image'
import { ShieldCheck } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'

export default function ModesPaiementPage() {
  const { lang } = useLanguage()
  const fr = lang === 'fr'

  const methods = fr ? [
    {
      name: 'Orange Money',
      img: '/payments/orange-money.png',
      color: 'bg-orange-50 border-orange-200',
      desc: 'Payez directement depuis votre compte Orange Money. Le paiement est instantané et sécurisé.',
      steps: [
        'Sélectionnez « Orange Money » lors du paiement',
        'Entrez votre numéro Orange Money',
        'Confirmez le paiement avec votre code secret sur votre téléphone',
        'Votre commande est validée instantanément',
      ],
      badge: 'Validation instantanée',
    },
    {
      name: 'MTN Mobile Money',
      img: '/payments/mtn-momo.png',
      color: 'bg-yellow-50 border-yellow-200',
      desc: 'Payez depuis votre compte MTN MoMo. Rapide, sans frais cachés, confirmé en quelques secondes.',
      steps: [
        'Sélectionnez « MTN Mobile Money » lors du paiement',
        'Entrez votre numéro MTN',
        'Approuvez la transaction sur votre téléphone',
        'Commande confirmée automatiquement',
      ],
      badge: 'Validation instantanée',
    },
    {
      name: 'Espèces (Cash on Delivery)',
      img: '/payments/cash.jpg',
      color: 'bg-emerald-50 border-emerald-200',
      desc: 'Payez en main propre au livreur lors de la réception de votre commande. Aucune information bancaire requise.',
      steps: [
        'Sélectionnez « Espèces à la livraison »',
        'Votre commande est traitée et préparée',
        'Le livreur passe à votre adresse',
        'Remettez le montant exact au livreur',
      ],
      badge: 'Validation à la livraison',
    },
  ] : [
    {
      name: 'Orange Money',
      img: '/payments/orange-money.png',
      color: 'bg-orange-50 border-orange-200',
      desc: 'Pay directly from your Orange Money account. Payment is instant and secure.',
      steps: [
        'Select "Orange Money" at checkout',
        'Enter your Orange Money number',
        'Confirm the payment with your PIN on your phone',
        'Your order is validated instantly',
      ],
      badge: 'Instant validation',
    },
    {
      name: 'MTN Mobile Money',
      img: '/payments/mtn-momo.png',
      color: 'bg-yellow-50 border-yellow-200',
      desc: 'Pay from your MTN MoMo account. Fast, no hidden fees, confirmed in seconds.',
      steps: [
        'Select "MTN Mobile Money" at checkout',
        'Enter your MTN number',
        'Approve the transaction on your phone',
        'Order confirmed automatically',
      ],
      badge: 'Instant validation',
    },
    {
      name: 'Cash on Delivery',
      img: '/payments/cash.jpg',
      color: 'bg-emerald-50 border-emerald-200',
      desc: 'Pay the delivery person directly when you receive your order. No banking information required.',
      steps: [
        'Select "Cash on delivery"',
        'Your order is processed and prepared',
        'The delivery person comes to your address',
        'Hand the exact amount to the delivery person',
      ],
      badge: 'Validated at delivery',
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <title>{fr ? 'Modes de paiement — BRICELO' : 'Payment methods — BRICELO'}</title>
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-navy-900)] mb-3">
          {fr ? 'Modes de paiement' : 'Payment methods'}
        </h1>
        <p className="text-[var(--color-slate-500)]">
          {fr
            ? 'BRICELO accepte plusieurs moyens de paiement adaptés au marché camerounais. Sécurisés, simples et rapides.'
            : 'BRICELO accepts several payment methods tailored to the Cameroonian market. Secure, simple and fast.'}
        </p>
      </div>

      <div className="flex flex-col gap-6 mb-10">
        {methods.map(({ name, img, color, desc, steps, badge }) => (
          <div key={name} className={`border rounded-2xl p-6 ${color} shadow-sm`}>
            <div className="flex items-start gap-4 mb-4">
              <div className="h-14 w-14 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 overflow-hidden p-1">
                <Image src={img} alt={name} width={56} height={56} className="h-full w-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-extrabold text-[var(--color-navy-900)]">{name}</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[var(--color-slate-600)] border border-[var(--color-slate-200)]">
                    {badge}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-slate-600)] mt-1">{desc}</p>
              </div>
            </div>
            <div className="bg-white/60 rounded-xl p-4">
              <p className="text-xs font-bold text-[var(--color-slate-500)] uppercase tracking-wider mb-2">
                {fr ? 'Comment payer' : 'How to pay'}
              </p>
              <ol className="flex flex-col gap-1.5">
                {steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-slate-700)]">
                    <span className="shrink-0 h-5 w-5 rounded-full bg-[var(--color-navy-900)] text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--color-navy-900)] rounded-2xl p-6 flex items-start gap-4">
        <ShieldCheck className="h-8 w-8 text-[var(--color-accent)] shrink-0 mt-0.5" />
        <div>
          <p className="text-white font-bold mb-1">
            {fr ? 'Paiements 100% sécurisés' : '100% secure payments'}
          </p>
          <p className="text-white/65 text-sm">
            {fr
              ? "Toutes vos transactions sur BRICELO sont chiffrées et sécurisées. Vos informations de paiement ne sont jamais stockées sur nos serveurs."
              : "All your transactions on BRICELO are encrypted and secure. Your payment information is never stored on our servers."}
          </p>
        </div>
      </div>
    </div>
  )
}
