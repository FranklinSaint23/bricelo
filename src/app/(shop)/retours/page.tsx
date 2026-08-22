'use client'

import Link from 'next/link'
import { RotateCcw, CheckCircle2, XCircle, Clock, MessageSquare } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'

export default function RetoursPage() {
  const { lang } = useLanguage()
  const fr = lang === 'fr'

  const eligible = fr ? [
    'Produit défectueux ou endommagé à la livraison',
    'Produit non conforme à la description',
    'Mauvaise taille ou couleur envoyée',
    'Produit manquant dans la commande',
  ] : [
    'Defective or damaged product upon delivery',
    'Product not matching the description',
    'Wrong size or colour sent',
    'Missing item in the order',
  ]

  const nonEligible = fr ? [
    'Produits ouverts ou utilisés (hors défaut)',
    'Produits périssables (alimentation)',
    'Articles personnalisés ou sur mesure',
    'Retour après 5 jours de réception',
    "Produit endommagé par l'acheteur",
  ] : [
    'Opened or used products (unless defective)',
    'Perishable goods (food)',
    'Personalised or custom-made items',
    'Return request after 5 days of receipt',
    'Product damaged by the buyer',
  ]

  const processSteps = fr ? [
    { Icon: MessageSquare, title: 'Signalez le problème', desc: "Contactez notre support dans les 5 jours suivant la réception via votre espace commandes ou notre page contact." },
    { Icon: Clock,         title: 'Traitement rapide',    desc: "Notre équipe examine votre demande et vous contacte pour valider le retour et organiser la récupération du colis." },
    { Icon: RotateCcw,     title: 'Renvoi du produit',   desc: "Emballez soigneusement le produit dans son emballage d'origine avec tous les accessoires et factures." },
    { Icon: CheckCircle2,  title: 'Remboursement',        desc: "Après réception et vérification, le remboursement est effectué rapidement sur votre moyen de paiement." },
  ] : [
    { Icon: MessageSquare, title: 'Report the issue',     desc: "Contact our support within 5 days of receipt via your orders section or our contact page." },
    { Icon: Clock,         title: 'Fast processing',      desc: "Our team reviews your request and contacts you to validate the return and arrange collection of the parcel." },
    { Icon: RotateCcw,     title: 'Return the product',   desc: "Pack the product carefully in its original packaging with all accessories and receipts." },
    { Icon: CheckCircle2,  title: 'Refund',               desc: "After receipt and verification, the refund is issued quickly to your payment method." },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <title>{fr ? 'Retours & Remboursements — BRICELO' : 'Returns & Refunds — BRICELO'}</title>
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-navy-900)] mb-3">
          {fr ? 'Retours & Remboursements' : 'Returns & Refunds'}
        </h1>
        <p className="text-[var(--color-slate-500)]">
          {fr
            ? <>Votre satisfaction est notre priorité. Vous avez <strong>5 jours</strong> après réception pour retourner un produit non conforme.</>
            : <>Your satisfaction is our priority. You have <strong>5 days</strong> after receipt to return a non-conforming product.</>}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <h2 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" /> {fr ? 'Retours acceptés' : 'Accepted returns'}
          </h2>
          <ul className="flex flex-col gap-2">
            {eligible.map((e) => (
              <li key={e} className="flex items-start gap-2 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> {e}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <h2 className="font-bold text-red-800 mb-3 flex items-center gap-2">
            <XCircle className="h-5 w-5" /> {fr ? 'Non éligibles au retour' : 'Not eligible for return'}
          </h2>
          <ul className="flex flex-col gap-2">
            {nonEligible.map((n) => (
              <li key={n} className="flex items-start gap-2 text-sm text-red-700">
                <XCircle className="h-4 w-4 shrink-0 mt-0.5" /> {n}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="text-xl font-extrabold text-[var(--color-navy-900)] mb-6">
        {fr ? 'Comment procéder ?' : 'How to proceed?'}
      </h2>
      <div className="flex flex-col gap-4 mb-10">
        {processSteps.map(({ Icon, title, desc }, i) => (
          <div key={title} className="flex gap-4 bg-white border border-[var(--color-slate-200)] rounded-2xl p-5 shadow-sm">
            <div className="shrink-0 flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-full bg-[var(--color-navy-900)] flex items-center justify-center">
                <Icon className="h-5 w-5 text-[var(--color-accent)]" />
              </div>
              {i < processSteps.length - 1 && <div className="flex-1 w-0.5 bg-[var(--color-slate-200)] mt-1 min-h-4" />}
            </div>
            <div>
              <p className="font-bold text-[var(--color-navy-900)]">{title}</p>
              <p className="text-sm text-[var(--color-slate-500)] mt-1">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--color-navy-900)] rounded-2xl p-6 text-center">
        <p className="text-white font-bold mb-1">
          {fr ? 'Un problème avec votre commande ?' : 'An issue with your order?'}
        </p>
        <p className="text-white/60 text-sm mb-4">
          {fr ? 'Notre équipe est disponible 7j/7 pour vous aider.' : 'Our team is available 7 days a week to help you.'}
        </p>
        <Link href="/contact"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-accent)] text-[var(--color-navy-900)] font-bold rounded-lg text-sm hover:opacity-90 transition-opacity">
          {fr ? 'Contacter le support' : 'Contact support'}
        </Link>
      </div>
    </div>
  )
}
