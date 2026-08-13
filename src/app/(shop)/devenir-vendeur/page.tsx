import Link from 'next/link'
import {
  CheckCircle2, ClipboardList, ShieldCheck, PackagePlus, Megaphone,
  ArrowRight, Store,
} from 'lucide-react'

export const metadata = { title: 'Comment devenir vendeur — BRICELO' }

const conditions = [
  'Vous devez avoir une boutique physique',
  'Un registre de commerce',
  'Une carte de contribuable',
  'Patente',
  "Une licence d'exploitation pour les produits de marque",
]

const dossier = [
  'Photocopie CNI',
  'Carte de contribuable',
  'Registre de commerce',
  'Plan de localisation',
  'Patente',
  "Une licence d'exploitation pour les produits de marques",
]

const commissions = [
  { categorie: 'Mode',                 taux: '6%',  packing: 500 },
  { categorie: 'Téléphone et tablette', taux: '6%',  packing: 500 },
  { categorie: 'Supermarché',           taux: '7%',  packing: 500 },
  { categorie: 'Jouets et jeux',        taux: '6%',  packing: 500 },
  { categorie: 'Santé et beauté',       taux: '6%',  packing: 500 },
  { categorie: 'Électroménager',        taux: '10%', packing: 500 },
  { categorie: 'Maison et bureau',      taux: '10%', packing: 500 },
  { categorie: 'Informatique',          taux: '5%',  packing: 500 },
  { categorie: 'Électronique',          taux: '13%', packing: 500 },
  { categorie: 'Produits bébé',         taux: '6%',  packing: 500 },
  { categorie: 'Divers',               taux: '13%', packing: 500 },
]

const etapes = [
  {
    num: 1,
    Icon: ClipboardList,
    title: 'Inscrivez-vous en ligne',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    iconColor: 'text-blue-600',
    content: (
      <div className="mt-3 flex flex-col gap-4">
        <p className="text-[var(--color-slate-600)] text-sm">
          Créez votre compte vendeur en quelques minutes. Renseignez vos informations personnelles et les détails de votre entreprise.
        </p>
        <Link
          href="/candidature-vendeur"
          className="inline-flex items-center gap-2 w-fit px-5 py-2.5 rounded-lg bg-[var(--color-navy-900)] text-white text-sm font-bold hover:bg-[var(--color-navy-800)] transition-colors"
        >
          Soumettre ma candidature <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="border border-[var(--color-slate-200)] rounded-xl p-4 bg-white">
          <p className="text-xs font-semibold text-[var(--color-slate-500)] uppercase tracking-wider mb-3">Informations requises à l&apos;inscription</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[var(--color-slate-700)]">
            {['Nom & Prénom', 'Adresse e-mail', 'Mot de passe', 'Sexe', 'Date de naissance', "Nom de l'entreprise"].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    num: 2,
    Icon: ShieldCheck,
    title: 'Fournissez un dossier constitué',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    iconColor: 'text-amber-600',
    content: (
      <ul className="mt-3 flex flex-col gap-2">
        {dossier.map((d) => (
          <li key={d} className="flex items-center gap-2 text-sm text-[var(--color-slate-700)]">
            <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
            {d}
          </li>
        ))}
      </ul>
    ),
  },
  {
    num: 3,
    Icon: Store,
    title: 'Validation de la création de la boutique en ligne',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    iconColor: 'text-purple-600',
    content: (
      <p className="mt-3 text-sm text-[var(--color-slate-600)]">
        Votre compte Seller Center sera activé dès lors et vous recevrez une formation dédiée par un gestionnaire de vendeurs.
      </p>
    ),
  },
  {
    num: 4,
    Icon: PackagePlus,
    title: 'Ajoutez vos produits en ligne',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconColor: 'text-emerald-600',
    content: (
      <p className="mt-3 text-sm text-[var(--color-slate-600)]">
        Depuis votre espace vendeur, publiez vos produits avec photos, descriptions et prix. Vos articles seront visibles par des milliers d&apos;acheteurs.
      </p>
    ),
  },
  {
    num: 5,
    Icon: Megaphone,
    title: 'Bénéficiez de nos promotions',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    iconColor: 'text-rose-600',
    content: (
      <p className="mt-3 text-sm text-[var(--color-slate-600)]">
        Faites accroître votre visibilité en rejoignant nos campagnes, promotions et événements commerciaux.
      </p>
    ),
  },
]

export default function DevenirVendeurPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

      {/* En-tête */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-navy-900)] mb-4">
          Comment devenir vendeur
        </h1>
        <p className="text-[var(--color-slate-600)] text-base sm:text-lg max-w-2xl">
          Vous souhaitez multiplier votre chiffre d&apos;affaires, vendre mieux, avoir plus de visibilité ? Vendez sur BRICELO.com. C&apos;est une démarche particulièrement intéressante car elle permet aux vendeurs d&apos;avoir une clientèle diversifiée.
        </p>
      </div>

      {/* Conditions */}
      <div className="bg-white border border-[var(--color-slate-200)] rounded-2xl p-6 mb-10 shadow-sm">
        <h2 className="text-lg font-bold text-[var(--color-navy-900)] mb-4">
          Conditions pour devenir vendeur
        </h2>
        <ul className="flex flex-col gap-2.5">
          {conditions.map((c) => (
            <li key={c} className="flex items-start gap-3 text-[var(--color-slate-700)] text-sm sm:text-base">
              <CheckCircle2 className="h-5 w-5 text-[var(--color-accent)] shrink-0 mt-0.5" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      {/* Étapes */}
      <div className="flex flex-col gap-6 mb-12">
        {etapes.map(({ num, Icon, title, color, iconColor, content }) => (
          <div key={num} className={`border rounded-2xl p-6 ${color}`}>
            <div className="flex items-center gap-3 mb-1">
              <div className={`h-9 w-9 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 ${iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-black text-base sm:text-lg">
                <span className="opacity-60 text-sm font-bold mr-1.5">Étape {num} —</span>
                {title}
              </p>
            </div>
            {content}
          </div>
        ))}
      </div>

      {/* Commissions */}
      <div className="bg-white border border-[var(--color-slate-200)] rounded-2xl p-6 shadow-sm mb-10">
        <h2 className="text-xl font-extrabold text-[var(--color-navy-900)] mb-2">
          Grille de commissions par catégories
        </h2>
        <p className="text-sm text-[var(--color-slate-500)] mb-6">
          Des frais de vente sont appliqués sur chacun des articles vendus, calculés sur le prix de vente total (prix + livraison) selon la catégorie produit.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[var(--color-navy-900)] text-white">
                <th className="text-left px-4 py-3 rounded-tl-lg font-semibold">Catégorie</th>
                <th className="text-center px-4 py-3 font-semibold">Commission BRICELO</th>
                <th className="text-center px-4 py-3 rounded-tr-lg font-semibold">Packing fees (FCFA)</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((row, i) => (
                <tr
                  key={row.categorie}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-[var(--color-slate-50)]'}
                >
                  <td className="px-4 py-3 text-[var(--color-slate-700)] font-medium border-b border-[var(--color-slate-100)]">
                    {row.categorie}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-[var(--color-navy-900)] border-b border-[var(--color-slate-100)]">
                    {row.taux}
                  </td>
                  <td className="px-4 py-3 text-center text-[var(--color-slate-600)] border-b border-[var(--color-slate-100)]">
                    {row.packing.toLocaleString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA final */}
      <div className="bg-[var(--color-navy-900)] rounded-2xl p-8 text-center">
        <p className="text-white text-xl font-black mb-2">À très vite, nous vous attendons déjà…</p>
        <p className="text-white/60 text-sm mb-6">Rejoignez des centaines de vendeurs qui font confiance à BRICELO.</p>
        <Link
          href="/candidature-vendeur"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[var(--color-accent)] text-[var(--color-navy-900)] font-black text-sm hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          <Store className="h-5 w-5" />
          Soumettre ma candidature
        </Link>
      </div>

    </div>
  )
}
