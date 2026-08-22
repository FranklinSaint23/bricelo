'use client'

import { ChevronDown } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'

export default function FaqPage() {
  const { t, lang } = useLanguage()

  const faqs = lang === 'fr' ? [
    {
      section: 'Acheter sur BRICELO',
      items: [
        { q: 'Comment passer une commande ?', a: "Choisissez votre produit, cliquez sur « Ajouter au panier » ou « Acheter maintenant », puis sélectionnez votre mode de paiement (espèces, Orange Money ou MTN MoMo) et validez. Vous recevrez une confirmation." },
        { q: 'Dois-je créer un compte pour commander ?', a: "Non. BRICELO accepte les commandes invité — vous pouvez acheter sans créer de compte. Cependant, un compte vous permet de suivre vos commandes, sauvegarder vos adresses et accéder à vos favoris." },
        { q: 'Comment puis-je suivre ma commande ?', a: 'Connectez-vous et rendez-vous dans « Mes commandes ». Vous y trouverez le statut en temps réel de chaque commande.' },
        { q: 'Quels moyens de paiement sont acceptés ?', a: 'Nous acceptons en priorité le paiement en espèces à la livraison (Cash on Delivery), ainsi qu’Orange Money et MTN Mobile Money. Les paiements en espèces sont validés à la livraison par notre équipe.' },
      ],
    },
    {
      section: 'Livraison',
      items: [
        { q: 'Quels sont les délais de livraison ?', a: 'La livraison s’effectue en moins de 3 heures de temps à Douala et Yaoundé.' },
        { q: 'Combien coûte la livraison ?', a: "Les frais de livraison varient selon la distance et le poids. Ils vous sont affichés clairement lors du passage en caisse, avant de confirmer votre commande." },
        { q: 'Livrez-vous à Douala et Yaoundé ?', a: 'Oui. Nous livrons à Douala et Yaoundé en moins de 3 heures de temps.' },
      ],
    },
    {
      section: 'Retours & Remboursements',
      items: [
        { q: 'Puis-je retourner un article ?', a: "Oui. Vous disposez de 5 jours après réception pour retourner un article défectueux ou non conforme à la description. Consultez notre politique de retour pour les conditions détaillées." },
        { q: 'Comment obtenir un remboursement ?', a: "Signalez le problème via votre espace client ou contactez notre service client. Après vérification, le remboursement est effectué rapidement sur votre moyen de paiement." },
      ],
    },
    {
      section: 'Vendre sur BRICELO',
      items: [
        { q: 'Comment devenir vendeur sur BRICELO ?', a: "Remplissez le formulaire de candidature vendeur. Notre équipe examinera votre dossier sous 48h. Une fois approuvé, vous créez votre boutique et ajoutez vos produits librement." },
        { q: 'Quelles sont les commissions appliquées ?', a: "Les commissions varient de 5% à 13% selon la catégorie produit, plus 500 FCFA de packing fees par article. Consultez la grille complète sur la page « Comment devenir vendeur »." },
        { q: 'Est-ce que BRICELO est gratuit pour les vendeurs ?', a: "L'inscription est gratuite. BRICELO prélève uniquement une commission sur chaque vente réalisée — pas de frais mensuels ni d'abonnement." },
      ],
    },
  ] : [
    {
      section: 'Buying on BRICELO',
      items: [
        { q: 'How do I place an order?', a: 'Choose your product, click "Add to cart" or "Buy now", then select your payment method (Cash on delivery, Orange Money or MTN MoMo) and confirm. You will receive a confirmation.' },
        { q: 'Do I need an account to order?', a: 'No. BRICELO accepts guest orders — you can buy without creating an account. However, an account lets you track orders, save addresses and access your wishlist.' },
        { q: 'How can I track my order?', a: 'Sign in and go to "My orders". You will find the real-time status of each order there.' },
        { q: 'What payment methods are accepted?', a: 'We accept Cash on Delivery first, as well as Orange Money and MTN Mobile Money. Cash payments are validated upon delivery by our team.' },
      ],
    },
    {
      section: 'Delivery',
      items: [
        { q: 'What are the delivery times?', a: 'Delivery takes place in under 3 hours in Douala and Yaoundé.' },
        { q: 'How much does delivery cost?', a: 'Delivery fees vary depending on distance and weight. They are clearly displayed at checkout before you confirm your order.' },
        { q: 'Do you deliver to Douala & Yaoundé?', a: 'Yes. We deliver in Douala and Yaoundé in under 3 hours.' },
      ],
    },
    {
      section: 'Returns & Refunds',
      items: [
        { q: 'Can I return an item?', a: 'Yes. You have 5 days after receiving your order to return a defective or incorrectly described item. See our return policy for full conditions.' },
        { q: 'How do I get a refund?', a: 'Report the issue through your account or contact our support team. After verification, the refund is issued quickly to your payment method.' },
      ],
    },
    {
      section: 'Selling on BRICELO',
      items: [
        { q: 'How do I become a seller on BRICELO?', a: 'Fill in the vendor application form. Our team will review your application within 48 hours. Once approved, you create your store and list your products freely.' },
        { q: 'What commissions are charged?', a: 'Commissions range from 5% to 13% depending on product category, plus a 500 FCFA packing fee per item. See the full grid on the "How to become a seller" page.' },
        { q: 'Is BRICELO free for sellers?', a: 'Registration is free. BRICELO only takes a commission on each sale made — no monthly fees or subscriptions.' },
      ],
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <title>{lang === 'fr' ? 'Questions fréquentes — BRICELO' : 'FAQ — BRICELO'}</title>
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-navy-900)] mb-3">
          {lang === 'fr' ? 'Questions fréquentes' : 'Frequently Asked Questions'}
        </h1>
        <p className="text-[var(--color-slate-500)]">
          {lang === 'fr' ? 'Trouvez rapidement les réponses à vos questions sur BRICELO.' : 'Find quick answers to your questions about BRICELO.'}
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {faqs.map((section) => (
          <div key={section.section}>
            <h2 className="text-lg font-bold text-[var(--color-navy-900)] mb-4 pb-2 border-b border-[var(--color-slate-200)]">
              {section.section}
            </h2>
            <div className="flex flex-col gap-2">
              {section.items.map((item) => (
                <details key={item.q} className="group bg-white border border-[var(--color-slate-200)] rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none font-semibold text-[var(--color-navy-900)] text-sm select-none gap-4">
                    {item.q}
                    <ChevronDown className="h-4 w-4 text-[var(--color-slate-400)] shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-5 pb-4 text-sm text-[var(--color-slate-600)] leading-relaxed border-t border-[var(--color-slate-100)]">
                    <p className="pt-3">{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
