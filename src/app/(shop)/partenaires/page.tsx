import Link from 'next/link'
import { Truck, MapPin, CheckCircle2, Package, Clock, TrendingUp } from 'lucide-react'

export const metadata = { title: 'Devenir partenaire logistique — BRICELO' }

const avantages = [
  { Icon: TrendingUp, title: 'Revenus réguliers',   desc: 'Gagnez à chaque livraison. Plus vous livrez, plus vous gagnez.' },
  { Icon: Clock,      title: 'Horaires flexibles',  desc: 'Travaillez selon vos disponibilités, en journée ou en soirée.' },
  { Icon: MapPin,     title: 'Votre secteur',       desc: 'Opérez dans votre quartier ou votre ville selon votre choix.' },
  { Icon: Package,    title: 'Outils fournis',      desc: "Application mobile de gestion des livraisons fournie par BRICELO." },
]

const conditions = [
  'Être majeur et résider au Cameroun',
  'Posséder un véhicule (moto, tricycle ou voiture)',
  'Avoir un permis de conduire en cours de validité',
  "Disposer d'un smartphone avec connexion internet",
  'Être disponible au minimum 20h par semaine',
  'Avoir une bonne connaissance de votre secteur de livraison',
]

const process = [
  { num: '01', title: 'Soumettez votre candidature', desc: 'Remplissez le formulaire ci-dessous avec vos informations et votre secteur de livraison.' },
  { num: '02', title: 'Entretien téléphonique',      desc: 'Notre équipe vous contacte sous 48h pour un entretien de 15 minutes.' },
  { num: '03', title: 'Formation',                   desc: 'Une formation courte vous présente l\'application de livraison et les procédures BRICELO.' },
  { num: '04', title: 'Démarrez les livraisons',     desc: 'Vous êtes activé sur la plateforme et commencez à recevoir des missions dans votre secteur.' },
]

export default function PartenairesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-navy-900)] mb-3">
          Devenir partenaire logistique
        </h1>
        <p className="text-[var(--color-slate-500)] text-lg">
          Rejoignez le réseau de livreurs BRICELO et gagnez de l'argent en livrant dans votre ville.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {avantages.map(({ Icon, title, desc }) => (
          <div key={title} className="bg-white border border-[var(--color-slate-200)] rounded-2xl p-5 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-[var(--color-accent)]/15 flex items-center justify-center mb-3">
              <Icon className="h-5 w-5 text-[var(--color-navy-900)]" />
            </div>
            <p className="font-bold text-[var(--color-navy-900)] mb-1">{title}</p>
            <p className="text-sm text-[var(--color-slate-500)]">{desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[var(--color-slate-200)] rounded-2xl p-6 mb-8 shadow-sm">
        <h2 className="font-extrabold text-[var(--color-navy-900)] mb-4">Conditions requises</h2>
        <ul className="flex flex-col gap-2.5">
          {conditions.map((c) => (
            <li key={c} className="flex items-start gap-2 text-sm text-[var(--color-slate-700)]">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      <h2 className="text-xl font-extrabold text-[var(--color-navy-900)] mb-5">Comment ça marche ?</h2>
      <div className="flex flex-col gap-4 mb-10">
        {process.map(({ num, title, desc }) => (
          <div key={num} className="flex gap-4 bg-[var(--color-slate-50)] border border-[var(--color-slate-200)] rounded-2xl p-5">
            <div className="h-10 w-10 rounded-full bg-[var(--color-navy-900)] text-[var(--color-accent)] font-extrabold text-sm flex items-center justify-center shrink-0">
              {num}
            </div>
            <div>
              <p className="font-bold text-[var(--color-navy-900)]">{title}</p>
              <p className="text-sm text-[var(--color-slate-500)] mt-1">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--color-navy-900)] rounded-2xl p-8 text-center">
        <Truck className="h-10 w-10 text-[var(--color-accent)] mx-auto mb-3" />
        <p className="text-white font-extrabold text-xl mb-2">Prêt à rejoindre l'aventure ?</p>
        <p className="text-white/60 text-sm mb-6">Envoyez votre candidature et notre équipe vous répondra sous 48h.</p>
        <Link href="/contact"
          className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--color-accent)] text-[var(--color-navy-900)] font-bold rounded-xl hover:opacity-90 transition-opacity text-sm">
          Postuler comme livreur
        </Link>
      </div>
    </div>
  )
}
