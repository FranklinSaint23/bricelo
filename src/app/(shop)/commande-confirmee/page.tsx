'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Phone, Package, ArrowRight, Download } from 'lucide-react'
import { Suspense } from 'react'
import { useLanguage } from '@/components/providers/language-provider'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const rawOrders = searchParams.get('orders') ?? ''
  const extRef = searchParams.get('external_reference') ?? searchParams.get('reference') ?? ''
  let orderIds = rawOrders ? rawOrders.split(/[,-]/).filter(Boolean) : []
  if (orderIds.length === 0 && extRef) {
    orderIds = [extRef]
  }

  const steps = [
    { icon: Phone,   title: t.phoneConfirm,  desc: t.phoneConfirmDesc },
    { icon: Package, title: t.prepDelivery,  desc: t.prepDeliveryDesc },
  ]

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">

        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-11 w-11 text-green-600" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-navy-900)] mb-3">
          {t.orderReceived}
        </h1>
        <p className="text-[var(--color-slate-600)] mb-6 leading-relaxed">
          {t.orderReceivedSub}
        </p>

        {orderIds.length > 0 && (
          <div className="bg-[var(--color-slate-100)] rounded-xl px-5 py-4 mb-6 text-sm">
            <p className="text-[var(--color-slate-500)] text-xs font-semibold uppercase tracking-wider mb-2">
              {orderIds.length > 1 ? t.orderRefs : t.orderRef}
            </p>
            {orderIds.map((id) => (
              <p key={id} className="font-mono font-bold text-[var(--color-navy-900)] text-xs">
                #{id.slice(0, 8).toUpperCase()}
              </p>
            ))}
          </div>
        )}

        {/* Notice Produit Digital */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-4 mb-6 text-xs text-indigo-950 text-left font-medium space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-indigo-900 text-sm">
            <Download className="h-4 w-4 text-amber-500" /> Vos Produits Digitaux & Téléchargements
          </p>
          <p>Si votre commande contient un livre E-Book, un logiciel ou une formation digitale, accédez directement aux liens de téléchargement dans votre espace <strong>"Mes Commandes"</strong>.</p>
        </div>

        <div className="grid gap-3 mb-10">
          {steps.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4 text-left bg-[var(--color-surface)] border border-[var(--color-slate-200)] rounded-xl px-5 py-4">
              <div className="h-9 w-9 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
                <Icon className="h-4.5 w-4.5 text-[var(--color-accent)]" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-navy-900)]">{title}</p>
                <p className="text-xs text-[var(--color-slate-500)] mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/commandes"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-[var(--radius-lg)] bg-[var(--color-navy-900)] text-white text-sm font-bold hover:bg-[var(--color-navy-950)] transition-colors"
          >
            {t.trackOrders} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-11 px-6 rounded-[var(--radius-lg)] border border-[var(--color-slate-300)] text-sm font-semibold text-[var(--color-navy-900)] hover:bg-[var(--color-slate-50)] transition-colors"
          >
            {t.backHome}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CommandeConfirmeePage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <ConfirmationContent />
    </Suspense>
  )
}
