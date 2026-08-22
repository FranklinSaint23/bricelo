'use client'

import Link from 'next/link'
import { Search, ShoppingCart, CreditCard, Truck, Star, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'

export default function GuideAchatPage() {
  const { lang } = useLanguage()
  const fr = lang === 'fr'

  const steps = fr ? [
    {
      Icon: Search,
      num: '01',
      title: 'Trouvez votre produit',
      content: [
        'Utilisez la barre de recherche pour trouver un produit précis',
        'Parcourez les catégories depuis la navigation',
        'Filtrez par prix, note ou catégorie dans le catalogue',
        'Consultez les fiches produit avec photos, description et avis',
      ],
    },
    {
      Icon: ShoppingCart,
      num: '02',
      title: 'Ajoutez au panier ou achetez directement',
      content: [
        '« Ajouter au panier » : continuez vos achats et commandez plusieurs articles',
        '« Acheter maintenant » : passez directement au paiement pour un article unique',
        'Vérifiez le stock disponible avant de commander',
        'Les produits restent 30 minutes dans votre panier',
      ],
    },
    {
      Icon: CreditCard,
      num: '03',
      title: 'Choisissez votre mode de paiement',
      content: [
        'Espèces (Cash on Delivery) : payez à la livraison',
        'Orange Money : paiement instantané via votre compte Orange',
        'MTN Mobile Money : paiement instantané via votre compte MTN',
        'Aucune carte bancaire requise',
      ],
    },
    {
      Icon: Truck,
      num: '04',
      title: 'Recevez votre commande',
      content: [
        'Renseignez votre adresse de livraison exacte',
        'Livraison express en moins de 3h de temps à Douala & Yaoundé',
        'Suivez votre commande en temps réel dans votre espace',
      ],
    },
    {
      Icon: Star,
      num: '05',
      title: 'Laissez un avis',
      content: [
        'Notez votre achat sur 5 étoiles',
        'Rédigez un commentaire pour aider les autres acheteurs',
        'Aucune inscription requise pour laisser un avis',
        'Vos avis aident à améliorer la qualité des vendeurs',
      ],
    },
  ] : [
    {
      Icon: Search,
      num: '01',
      title: 'Find your product',
      content: [
        'Use the search bar to find a specific product',
        'Browse categories from the navigation',
        'Filter by price, rating or category in the catalogue',
        'View product pages with photos, description and reviews',
      ],
    },
    {
      Icon: ShoppingCart,
      num: '02',
      title: 'Add to cart or buy directly',
      content: [
        '"Add to cart": continue shopping and order multiple items',
        '"Buy now": go straight to checkout for a single item',
        'Check available stock before ordering',
        'Items stay in your cart for 30 minutes',
      ],
    },
    {
      Icon: CreditCard,
      num: '03',
      title: 'Choose your payment method',
      content: [
        'Orange Money: instant payment via your Orange account',
        'MTN Mobile Money: instant payment via your MTN account',
        'Cash on Delivery: pay when your order arrives',
        'No bank card required',
      ],
    },
    {
      Icon: Truck,
      num: '04',
      title: 'Receive your order',
      content: [
        'Enter your exact delivery address',
        'Express delivery in 3h in Douala & Yaoundé',
        'Delivery within 1 to 4 days in other cities',
        'Track your order in real time in your account',
      ],
    },
    {
      Icon: Star,
      num: '05',
      title: 'Leave a review',
      content: [
        'Rate your purchase out of 5 stars',
        'Write a comment to help other buyers',
        'No account required to leave a review',
        'Your reviews help improve seller quality',
      ],
    },
  ]

  const tips = fr ? [
    "Vérifiez toujours la note et les avis du vendeur avant d'acheter.",
    'Comparez les prix entre plusieurs vendeurs pour le même produit.',
    'Lisez attentivement la description et les caractéristiques du produit.',
    'Vérifiez les délais et frais de livraison avant de valider.',
    "En cas de problème, contactez d'abord le vendeur, puis notre support.",
  ] : [
    "Always check the seller's rating and reviews before buying.",
    'Compare prices across several sellers for the same product.',
    'Read the product description and specifications carefully.',
    'Check delivery times and fees before confirming.',
    'If there is an issue, contact the seller first, then our support team.',
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <title>{fr ? "Guide d'achat — BRICELO" : 'Buying guide — BRICELO'}</title>
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-navy-900)] mb-3">
          {fr ? 'Comment acheter sur BRICELO ?' : 'How to buy on BRICELO?'}
        </h1>
        <p className="text-[var(--color-slate-500)]">
          {fr
            ? 'Votre guide complet pour passer votre première commande en toute confiance.'
            : 'Your complete guide to placing your first order with confidence.'}
        </p>
      </div>

      <div className="flex flex-col gap-6 mb-12">
        {steps.map(({ Icon, num, title, content }) => (
          <div key={num} className="bg-white border border-[var(--color-slate-200)] rounded-2xl p-6 shadow-sm flex gap-5">
            <div className="shrink-0">
              <div className="h-12 w-12 rounded-2xl bg-[var(--color-navy-900)] flex items-center justify-center">
                <Icon className="h-6 w-6 text-[var(--color-accent)]" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-widest mb-1">
                {fr ? 'Étape' : 'Step'} {num}
              </p>
              <h2 className="font-extrabold text-[var(--color-navy-900)] mb-3">{title}</h2>
              <ul className="flex flex-col gap-1.5">
                {content.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-[var(--color-slate-600)]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 rounded-2xl p-6 mb-8">
        <h2 className="font-bold text-[var(--color-navy-900)] mb-4">
          {fr ? 'Conseils pour bien acheter' : 'Tips for a great experience'}
        </h2>
        <ul className="flex flex-col gap-2.5">
          {tips.map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-sm text-[var(--color-navy-900)]">
              <CheckCircle2 className="h-4 w-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="text-center">
        <Link href="/catalogue"
          className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--color-navy-900)] text-white font-bold rounded-xl hover:bg-[var(--color-navy-800)] transition-colors">
          {fr ? 'Commencer mes achats' : 'Start shopping'}
        </Link>
      </div>
    </div>
  )
}
