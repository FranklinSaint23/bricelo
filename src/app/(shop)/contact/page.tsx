'use client'

import { Mail, Phone, MapPin, Clock, MessageSquare } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'

export default function ContactPage() {
  const { lang } = useLanguage()
  const fr = lang === 'fr'

  const contactInfo = [
    { Icon: Mail,  label: fr ? 'E-mail'    : 'Email',   value: 'contact@bricelo.com', sub: fr ? 'Réponse sous 24h'           : 'Reply within 24h' },
    { Icon: Phone, label: fr ? 'Téléphone' : 'Phone',   value: '+237 6XX XXX XXX',   sub: fr ? 'Lun–Sam, 8h–20h'            : 'Mon–Sat, 8am–8pm' },
    { Icon: MapPin,label: fr ? 'Adresse'   : 'Address', value: 'Douala, Cameroun',    sub: fr ? 'Siège social BRICELO'       : 'BRICELO headquarters' },
    { Icon: Clock, label: fr ? 'Horaires'  : 'Hours',   value: fr ? 'Lun–Dim : 8h – 22h' : 'Mon–Sun: 8am – 10pm', sub: fr ? 'Service client disponible' : 'Customer service available' },
  ]

  const subjects = fr
    ? ['Problème avec une commande', 'Retour / Remboursement', 'Problème de paiement', 'Signaler un produit', 'Candidature vendeur', 'Autre']
    : ['Issue with an order', 'Return / Refund', 'Payment issue', 'Report a product', 'Vendor application', 'Other']

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <title>{fr ? 'Contactez-nous — BRICELO' : 'Contact us — BRICELO'}</title>
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-navy-900)] mb-3">
          {fr ? 'Contactez-nous' : 'Contact us'}
        </h1>
        <p className="text-[var(--color-slate-500)]">
          {fr ? 'Notre équipe est disponible 7j/7 pour vous aider.' : 'Our team is available 7 days a week to help you.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white border border-[var(--color-slate-200)] rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-[var(--color-navy-900)] mb-5 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[var(--color-accent)]" />
            {fr ? 'Envoyer un message' : 'Send a message'}
          </h2>
          <form className="flex flex-col gap-4" action="mailto:contact@bricelo.com" method="get">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-navy-900)]">{fr ? 'Nom complet *' : 'Full name *'}</label>
              <input type="text" name="name" required placeholder={fr ? 'Jean Dupont' : 'John Doe'}
                className="h-10 px-3 text-sm border border-[var(--color-slate-200)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-navy-900)]">{fr ? 'Adresse e-mail *' : 'Email address *'}</label>
              <input type="email" name="email" required placeholder="vous@email.com"
                className="h-10 px-3 text-sm border border-[var(--color-slate-200)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-navy-900)]">{fr ? 'Sujet' : 'Subject'}</label>
              <select name="subject"
                className="h-10 px-3 text-sm border border-[var(--color-slate-200)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]">
                <option value="">{fr ? '— Choisir —' : '— Choose —'}</option>
                {subjects.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-navy-900)]">{fr ? 'Message *' : 'Message *'}</label>
              <textarea name="body" required rows={5} placeholder={fr ? 'Décrivez votre demande...' : 'Describe your request...'}
                className="px-3 py-2.5 text-sm border border-[var(--color-slate-200)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none" />
            </div>
            <button type="submit"
              className="h-11 bg-[var(--color-navy-900)] text-white font-bold text-sm rounded-lg hover:bg-[var(--color-navy-800)] transition-colors">
              {fr ? 'Envoyer le message' : 'Send message'}
            </button>
          </form>
        </div>

        {/* Contact info */}
        <div className="flex flex-col gap-5">
          {contactInfo.map(({ Icon, label, value, sub }) => (
            <div key={label} className="bg-white border border-[var(--color-slate-200)] rounded-2xl p-5 shadow-sm flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-[var(--color-accent)]/15 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-[var(--color-navy-900)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-slate-400)] font-semibold uppercase tracking-wider">{label}</p>
                <p className="font-bold text-[var(--color-navy-900)] text-sm mt-0.5">{value}</p>
                <p className="text-xs text-[var(--color-slate-500)] mt-0.5">{sub}</p>
              </div>
            </div>
          ))}

          <div className="bg-[var(--color-navy-900)] rounded-2xl p-5 text-white">
            <p className="font-bold mb-1">WhatsApp BRICELO</p>
            <p className="text-sm text-white/65 mb-3">
              {fr ? 'Chattez directement avec notre équipe support.' : 'Chat directly with our support team.'}
            </p>
            <a href="https://wa.me/237600000000" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {fr ? 'Ouvrir WhatsApp' : 'Open WhatsApp'}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
