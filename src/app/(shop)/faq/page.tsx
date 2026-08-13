import { ChevronDown } from 'lucide-react'

export const metadata = { title: 'Questions fréquentes — BRICELO' }

const faqs = [
  {
    section: 'Acheter sur BRICELO',
    items: [
      {
        q: 'Comment passer une commande ?',
        a: "Choisissez votre produit, cliquez sur « Ajouter au panier » ou « Acheter maintenant », puis sélectionnez votre mode de paiement (Orange Money, MTN MoMo ou espèces) et validez. Vous recevrez une confirmation par e-mail.",
      },
      {
        q: 'Dois-je créer un compte pour commander ?',
        a: "Non. BRICELO accepte les commandes invité — vous pouvez acheter sans créer de compte. Cependant, un compte vous permet de suivre vos commandes, sauvegarder vos adresses et accéder à vos favoris.",
      },
      {
        q: 'Comment puis-je suivre ma commande ?',
        a: 'Connectez-vous et rendez-vous dans « Mes commandes ». Vous y trouverez le statut en temps réel de chaque commande.',
      },
      {
        q: 'Quels moyens de paiement sont acceptés ?',
        a: 'Nous acceptons Orange Money, MTN Mobile Money et le paiement en espèces à la livraison (Cash on Delivery). Les paiements mobiles sont validés automatiquement ; le cash est validé par notre équipe après livraison.',
      },
    ],
  },
  {
    section: 'Livraison',
    items: [
      {
        q: 'Quels sont les délais de livraison ?',
        a: 'À Douala et Yaoundé, la livraison est possible en 3 heures pour les commandes urgentes. Dans les autres villes, comptez 1 à 4 jours ouvrables selon la localisation.',
      },
      {
        q: 'Combien coûte la livraison ?',
        a: "Les frais de livraison varient selon la distance et le poids. Ils vous sont affichés clairement lors du passage en caisse, avant de confirmer votre commande.",
      },
      {
        q: 'Livrez-vous partout au Cameroun ?',
        a: 'Oui. Nous livrons dans toutes les grandes villes du Cameroun. La livraison express (3h) est disponible uniquement à Douala et Yaoundé.',
      },
    ],
  },
  {
    section: 'Retours & Remboursements',
    items: [
      {
        q: 'Puis-je retourner un article ?',
        a: "Oui. Vous disposez de 7 jours après réception pour retourner un article défectueux ou non conforme à la description. Consultez notre politique de retour pour les conditions détaillées.",
      },
      {
        q: 'Comment obtenir un remboursement ?',
        a: "Signalez le problème via votre espace client ou contactez notre service client. Après vérification, le remboursement est effectué sur votre moyen de paiement initial sous 5 à 10 jours ouvrables.",
      },
    ],
  },
  {
    section: 'Vendre sur BRICELO',
    items: [
      {
        q: 'Comment devenir vendeur sur BRICELO ?',
        a: "Remplissez le formulaire de candidature vendeur. Notre équipe examinera votre dossier sous 48h. Une fois approuvé, vous créez votre boutique et ajoutez vos produits librement.",
      },
      {
        q: 'Quelles sont les commissions appliquées ?',
        a: "Les commissions varient de 5% à 13% selon la catégorie produit, plus 500 FCFA de packing fees par article. Consultez la grille complète sur la page « Comment devenir vendeur ».",
      },
      {
        q: 'Est-ce que BRICELO est gratuit pour les vendeurs ?',
        a: "L'inscription est gratuite. BRICELO prélève uniquement une commission sur chaque vente réalisée — pas de frais mensuels ni d'abonnement.",
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-navy-900)] mb-3">Questions fréquentes</h1>
        <p className="text-[var(--color-slate-500)]">Trouvez rapidement les réponses à vos questions sur BRICELO.</p>
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
