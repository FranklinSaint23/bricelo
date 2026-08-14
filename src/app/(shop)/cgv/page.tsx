'use client'

import { useLanguage } from '@/components/providers/language-provider'

export default function CgvPage() {
  const { lang } = useLanguage()
  const fr = lang === 'fr'

  const sections = fr ? [
    { title: '1. Présentation de BRICELO', content: `BRICELO.com est une marketplace en ligne exploitée par la société BRICELO SAS, dont le siège social est situé à Douala, Cameroun. La plateforme met en relation des acheteurs et des vendeurs professionnels ou particuliers basés principalement au Cameroun.` },
    { title: '2. Acceptation des conditions', content: `L'utilisation de BRICELO.com implique l'acceptation pleine et entière des présentes Conditions Générales de Vente. Ces conditions peuvent être modifiées à tout moment ; la version applicable est celle en vigueur au moment de la commande.` },
    { title: '3. Inscription et compte utilisateur', content: `La création d'un compte est facultative pour passer commande. Cependant, certaines fonctionnalités (suivi de commande, favoris, historique) nécessitent un compte. L'utilisateur est responsable de la confidentialité de ses identifiants. Toute commande passée depuis son compte engage sa responsabilité.` },
    { title: '4. Produits et disponibilité', content: `Les produits présentés sur BRICELO sont mis en vente par des vendeurs tiers. BRICELO n'est pas le vendeur des produits mais l'intermédiaire technique. La disponibilité des produits est indiquée sur chaque fiche produit. En cas d'indisponibilité après commande, le client est informé et remboursé intégralement.` },
    { title: '5. Prix', content: `Les prix sont affichés en Francs CFA (FCFA) toutes taxes comprises. Les frais de livraison sont indiqués séparément lors du passage en caisse. BRICELO se réserve le droit de modifier les prix à tout moment, mais les commandes sont facturées au prix en vigueur au moment de la validation.` },
    { title: '6. Commande et paiement', content: `La commande est confirmée après validation du paiement ou, pour les paiements en espèces, après confirmation de livraison. Les moyens de paiement acceptés sont : Orange Money, MTN Mobile Money, et espèces à la livraison. Les commandes payées par mobile money sont traitées immédiatement. Les commandes en espèces sont soumises à validation manuelle.` },
    { title: '7. Livraison', content: `Les délais de livraison sont indicatifs. BRICELO s'engage à faire ses meilleurs efforts pour respecter les délais annoncés. En cas de retard significatif, le client sera informé. Le risque de perte ou détérioration est transféré à l'acheteur à la livraison.` },
    { title: '8. Retours et remboursements', content: `L'acheteur dispose de 7 jours après réception pour signaler un produit défectueux ou non conforme. Le retour doit être effectué dans l'état d'origine avec tous les accessoires. Le remboursement est effectué dans les 5 à 10 jours ouvrables après réception et vérification du retour.` },
    { title: '9. Responsabilité', content: `BRICELO agit en tant qu'intermédiaire et ne peut être tenu responsable des litiges entre acheteurs et vendeurs, sauf en cas de faute prouvée de sa part. BRICELO met tout en œuvre pour garantir la qualité des vendeurs présents sur la plateforme.` },
    { title: '10. Données personnelles', content: `Les données personnelles collectées sont utilisées pour le traitement des commandes, l'amélioration des services et la communication commerciale (avec consentement). Conformément à la réglementation en vigueur, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Consultez notre politique de confidentialité pour plus de détails.` },
    { title: '11. Droit applicable', content: `Les présentes CGV sont soumises au droit camerounais. En cas de litige non résolu à l'amiable, les tribunaux compétents de Douala seront saisis.` },
  ] : [
    { title: '1. About BRICELO', content: `BRICELO.com is an online marketplace operated by BRICELO SAS, headquartered in Douala, Cameroon. The platform connects buyers and professional or individual sellers based primarily in Cameroon.` },
    { title: '2. Acceptance of terms', content: `Use of BRICELO.com implies full acceptance of these Terms and Conditions. These terms may be updated at any time; the version in force at the time of the order applies.` },
    { title: '3. Registration and user account', content: `Creating an account is optional to place an order. However, certain features (order tracking, wishlist, history) require an account. The user is responsible for keeping their credentials confidential. Any order placed from their account is their responsibility.` },
    { title: '4. Products and availability', content: `Products listed on BRICELO are sold by third-party sellers. BRICELO is not the seller but the technical intermediary. Product availability is indicated on each product page. If a product becomes unavailable after an order, the customer is notified and fully refunded.` },
    { title: '5. Pricing', content: `Prices are displayed in CFA Francs (FCFA) inclusive of all taxes. Delivery fees are shown separately at checkout. BRICELO reserves the right to change prices at any time, but orders are billed at the price in effect at the time of confirmation.` },
    { title: '6. Order and payment', content: `An order is confirmed after payment is validated or, for cash payments, after delivery confirmation. Accepted payment methods: Orange Money, MTN Mobile Money, and cash on delivery. Mobile money orders are processed immediately. Cash orders are subject to manual validation.` },
    { title: '7. Delivery', content: `Delivery times are indicative. BRICELO will make every effort to meet the announced times. In the event of a significant delay, the customer will be informed. Risk of loss or damage transfers to the buyer upon delivery.` },
    { title: '8. Returns and refunds', content: `The buyer has 7 days after receipt to report a defective or non-conforming product. The return must be in its original condition with all accessories. The refund is issued within 5–10 business days after receipt and verification of the return.` },
    { title: '9. Liability', content: `BRICELO acts as an intermediary and cannot be held liable for disputes between buyers and sellers, except in cases of proven fault on its part. BRICELO makes every effort to ensure the quality of sellers on the platform.` },
    { title: '10. Personal data', content: `Personal data collected is used for order processing, service improvement and commercial communication (with consent). You have the right to access, correct and delete your data. See our privacy policy for details.` },
    { title: '11. Applicable law', content: `These terms are governed by Cameroonian law. Any unresolved dispute shall be submitted to the competent courts of Douala.` },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <title>{fr ? 'Conditions générales de vente — BRICELO' : 'Terms and Conditions — BRICELO'}</title>
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-navy-900)] mb-3">
          {fr ? 'Conditions Générales de Vente' : 'Terms and Conditions'}
        </h1>
        <p className="text-sm text-[var(--color-slate-400)]">{fr ? 'Dernière mise à jour : août 2026' : 'Last updated: August 2026'}</p>
      </div>

      <div className="flex flex-col gap-8">
        {sections.map((s) => (
          <div key={s.title} className="bg-white border border-[var(--color-slate-200)] rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-[var(--color-navy-900)] mb-3">{s.title}</h2>
            <p className="text-sm text-[var(--color-slate-600)] leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
