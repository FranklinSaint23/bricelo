import Link from 'next/link'
import { Tag, Percent, Bell, Zap } from 'lucide-react'

export const metadata = { title: 'Promotions & Bons plans — BRICELO' }

export default function PromotionsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-navy-900)] mb-3">
          Promotions & Bons plans
        </h1>
        <p className="text-[var(--color-slate-500)]">
          Ne ratez aucune offre. Découvrez comment profiter des meilleures promotions sur BRICELO.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
        {[
          {
            Icon: Percent,
            title: 'Prix barrés',
            color: 'bg-red-50 border-red-200 text-red-700',
            desc: "Repérez les produits avec un prix barré : le prix d'origine est affiché à côté du prix promotionnel. Ces offres sont valables jusqu'à épuisement des stocks.",
          },
          {
            Icon: Zap,
            title: 'Flash Sales',
            color: 'bg-amber-50 border-amber-200 text-amber-700',
            desc: "Les ventes flash sont des promotions à durée limitée avec des remises jusqu'à -70%. Un timer décompte le temps restant directement sur la fiche produit.",
          },
          {
            Icon: Tag,
            title: 'Étiquettes promo',
            color: 'bg-purple-50 border-purple-200 text-purple-700',
            desc: 'Les vendeurs peuvent apposer des étiquettes personnalisées comme "SOLDES", "BLACK FRIDAY" ou "DÉSTOCKAGE" sur leurs produits en promotion.',
          },
          {
            Icon: Bell,
            title: 'Alertes promotions',
            color: 'bg-blue-50 border-blue-200 text-blue-700',
            desc: 'Abonnez-vous à notre newsletter pour recevoir les meilleures offres en avant-première directement dans votre boîte mail.',
          },
        ].map(({ Icon, title, color, desc }) => (
          <div key={title} className={`border rounded-2xl p-5 ${color}`}>
            <Icon className="h-7 w-7 mb-3" />
            <h2 className="font-bold mb-2">{title}</h2>
            <p className="text-sm opacity-80 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-[var(--color-navy-900)] rounded-2xl p-6 mb-6">
        <h2 className="text-white font-extrabold text-lg mb-2">Codes promo</h2>
        <p className="text-white/65 text-sm mb-4">
          Vous avez un code promo ? Entrez-le dans le champ dédié lors du passage en caisse, avant de valider votre commande. Le montant de la réduction est automatiquement appliqué.
        </p>
        <div className="bg-white/10 rounded-xl p-4 text-white/80 text-sm font-mono">
          Champ « Code promo » → disponible à la page de paiement
        </div>
      </div>

      <div className="text-center">
        <p className="text-[var(--color-slate-500)] text-sm mb-4">Découvrez tous les produits en promotion dès maintenant</p>
        <Link href="/catalogue"
          className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--color-navy-900)] text-white font-bold rounded-xl hover:bg-[var(--color-navy-800)] transition-colors">
          <Percent className="h-4 w-4" />
          Voir les promotions
        </Link>
      </div>
    </div>
  )
}
