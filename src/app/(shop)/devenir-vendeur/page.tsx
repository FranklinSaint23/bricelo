'use client'

import Link from 'next/link'
import {
  CheckCircle2, ClipboardList, ShieldCheck, PackagePlus, Megaphone,
  ArrowRight, Store,
} from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'

const commissions = [
  { categorie: 'Mode',                  categorieEn: 'Fashion',              taux: '6%',  packing: 500 },
  { categorie: 'Téléphone et tablette', categorieEn: 'Phone & tablet',       taux: '6%',  packing: 500 },
  { categorie: 'Supermarché',           categorieEn: 'Supermarket',          taux: '7%',  packing: 500 },
  { categorie: 'Jouets et jeux',        categorieEn: 'Toys & games',         taux: '6%',  packing: 500 },
  { categorie: 'Santé et beauté',       categorieEn: 'Health & beauty',      taux: '6%',  packing: 500 },
  { categorie: 'Électroménager',        categorieEn: 'Home appliances',      taux: '10%', packing: 500 },
  { categorie: 'Maison et bureau',      categorieEn: 'Home & office',        taux: '10%', packing: 500 },
  { categorie: 'Informatique',          categorieEn: 'Computing',            taux: '5%',  packing: 500 },
  { categorie: 'Électronique',          categorieEn: 'Electronics',          taux: '13%', packing: 500 },
  { categorie: 'Produits bébé',         categorieEn: 'Baby products',        taux: '6%',  packing: 500 },
  { categorie: 'Divers',               categorieEn: 'Miscellaneous',        taux: '13%', packing: 500 },
]

export default function DevenirVendeurPage() {
  const { lang } = useLanguage()
  const fr = lang === 'fr'

  const conditions = fr ? [
    'Vous devez avoir une boutique physique',
    'Un registre de commerce',
    'Une carte de contribuable',
    'Patente',
    "Une licence d'exploitation pour les produits de marque",
  ] : [
    'You must have a physical store',
    'A trade register',
    'A taxpayer card',
    'Business licence',
    'An operating licence for branded products',
  ]

  const dossier = fr ? [
    'Photocopie CNI',
    'Carte de contribuable',
    'Registre de commerce',
    'Plan de localisation',
    'Patente',
    "Une licence d'exploitation pour les produits de marques",
  ] : [
    'Copy of national ID',
    'Taxpayer card',
    'Trade register',
    'Location map',
    'Business licence',
    'Operating licence for branded products',
  ]

  const registrationFields = fr
    ? ['Nom & Prénom', 'Adresse e-mail', 'Mot de passe', 'Sexe', 'Date de naissance', "Nom de l'entreprise"]
    : ['First & Last name', 'Email address', 'Password', 'Gender', 'Date of birth', 'Company name']

  const etapes = [
    {
      num: 1,
      Icon: ClipboardList,
      title: fr ? 'Inscrivez-vous en ligne' : 'Register online',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      iconColor: 'text-blue-600',
    },
    {
      num: 2,
      Icon: ShieldCheck,
      title: fr ? 'Fournissez un dossier constitué' : 'Submit your application file',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      iconColor: 'text-amber-600',
    },
    {
      num: 3,
      Icon: Store,
      title: fr ? 'Validation de la création de la boutique en ligne' : 'Online store creation validation',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      iconColor: 'text-purple-600',
    },
    {
      num: 4,
      Icon: PackagePlus,
      title: fr ? 'Ajoutez vos produits en ligne' : 'List your products online',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconColor: 'text-emerald-600',
    },
    {
      num: 5,
      Icon: Megaphone,
      title: fr ? 'Bénéficiez de nos promotions' : 'Benefit from our promotions',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      iconColor: 'text-rose-600',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <title>{fr ? 'Comment devenir vendeur — BRICELO' : 'How to become a seller — BRICELO'}</title>

      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-navy-900)] mb-4">
          {fr ? 'Comment devenir vendeur' : 'How to become a seller'}
        </h1>
        <p className="text-[var(--color-slate-600)] text-base sm:text-lg max-w-2xl">
          {fr
            ? "Vous souhaitez multiplier votre chiffre d'affaires, vendre mieux, avoir plus de visibilité ? Vendez sur BRICELO.com. C'est une démarche particulièrement intéressante car elle permet aux vendeurs d'avoir une clientèle diversifiée."
            : "Want to grow your revenue, sell more, and reach more customers? Sell on BRICELO.com. It's a great opportunity to reach a diverse customer base."}
        </p>
      </div>

      <div className="bg-white border border-[var(--color-slate-200)] rounded-2xl p-6 mb-10 shadow-sm">
        <h2 className="text-lg font-bold text-[var(--color-navy-900)] mb-4">
          {fr ? 'Conditions pour devenir vendeur' : 'Requirements to become a seller'}
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

      <div className="flex flex-col gap-6 mb-12">
        {etapes.map(({ num, Icon, title, color, iconColor }) => (
          <div key={num} className={`border rounded-2xl p-6 ${color}`}>
            <div className="flex items-center gap-3 mb-1">
              <div className={`h-9 w-9 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 ${iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-black text-base sm:text-lg">
                <span className="opacity-60 text-sm font-bold mr-1.5">{fr ? 'Étape' : 'Step'} {num} —</span>
                {title}
              </p>
            </div>

            {num === 1 && (
              <div className="mt-3 flex flex-col gap-4">
                <p className="text-[var(--color-slate-600)] text-sm">
                  {fr
                    ? 'Créez votre compte vendeur en quelques minutes. Renseignez vos informations personnelles et les détails de votre entreprise.'
                    : 'Create your seller account in minutes. Fill in your personal information and business details.'}
                </p>
                <Link
                  href="/candidature-vendeur"
                  className="inline-flex items-center gap-2 w-fit px-5 py-2.5 rounded-lg bg-[var(--color-navy-900)] text-white text-sm font-bold hover:bg-[var(--color-navy-800)] transition-colors"
                >
                  {fr ? 'Soumettre ma candidature' : 'Submit my application'} <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="border border-[var(--color-slate-200)] rounded-xl p-4 bg-white">
                  <p className="text-xs font-semibold text-[var(--color-slate-500)] uppercase tracking-wider mb-3">
                    {fr ? "Informations requises à l'inscription" : 'Information required at registration'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[var(--color-slate-700)]">
                    {registrationFields.map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {num === 2 && (
              <ul className="mt-3 flex flex-col gap-2">
                {dossier.map((d) => (
                  <li key={d} className="flex items-center gap-2 text-sm text-[var(--color-slate-700)]">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            )}

            {num === 3 && (
              <p className="mt-3 text-sm text-[var(--color-slate-600)]">
                {fr
                  ? 'Votre compte Seller Center sera activé dès lors et vous recevrez une formation dédiée par un gestionnaire de vendeurs.'
                  : 'Your Seller Center account will be activated and you will receive dedicated training from a seller manager.'}
              </p>
            )}

            {num === 4 && (
              <p className="mt-3 text-sm text-[var(--color-slate-600)]">
                {fr
                  ? "Depuis votre espace vendeur, publiez vos produits avec photos, descriptions et prix. Vos articles seront visibles par des milliers d'acheteurs."
                  : "From your seller dashboard, publish your products with photos, descriptions and prices. Your items will be visible to thousands of buyers."}
              </p>
            )}

            {num === 5 && (
              <p className="mt-3 text-sm text-[var(--color-slate-600)]">
                {fr
                  ? 'Faites accroître votre visibilité en rejoignant nos campagnes, promotions et événements commerciaux.'
                  : 'Grow your visibility by joining our campaigns, promotions and commercial events.'}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white border border-[var(--color-slate-200)] rounded-2xl p-6 shadow-sm mb-10">
        <h2 className="text-xl font-extrabold text-[var(--color-navy-900)] mb-2">
          {fr ? 'Grille de commissions par catégories' : 'Commission grid by category'}
        </h2>
        <p className="text-sm text-[var(--color-slate-500)] mb-6">
          {fr
            ? 'Des frais de vente sont appliqués sur chacun des articles vendus, calculés sur le prix de vente total (prix + livraison) selon la catégorie produit.'
            : 'Selling fees apply to each item sold, calculated on the total selling price (price + delivery) based on product category.'}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[var(--color-navy-900)] text-white">
                <th className="text-left px-4 py-3 rounded-tl-lg font-semibold">
                  {fr ? 'Catégorie' : 'Category'}
                </th>
                <th className="text-center px-4 py-3 font-semibold">
                  {fr ? 'Commission BRICELO' : 'BRICELO commission'}
                </th>
                <th className="text-center px-4 py-3 rounded-tr-lg font-semibold">
                  Packing fees (FCFA)
                </th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((row, i) => (
                <tr key={row.categorie} className={i % 2 === 0 ? 'bg-white' : 'bg-[var(--color-slate-50)]'}>
                  <td className="px-4 py-3 text-[var(--color-slate-700)] font-medium border-b border-[var(--color-slate-100)]">
                    {fr ? row.categorie : row.categorieEn}
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

      <div className="bg-[var(--color-navy-900)] rounded-2xl p-8 text-center">
        <p className="text-white text-xl font-black mb-2">
          {fr ? 'À très vite, nous vous attendons déjà…' : "See you soon — we're already waiting for you…"}
        </p>
        <p className="text-white/60 text-sm mb-6">
          {fr
            ? 'Rejoignez des centaines de vendeurs qui font confiance à BRICELO.'
            : 'Join hundreds of sellers who trust BRICELO.'}
        </p>
        <Link
          href="/candidature-vendeur"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[var(--color-accent)] text-[var(--color-navy-900)] font-black text-sm hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          <Store className="h-5 w-5" />
          {fr ? 'Soumettre ma candidature' : 'Submit my application'}
        </Link>
      </div>
    </div>
  )
}
