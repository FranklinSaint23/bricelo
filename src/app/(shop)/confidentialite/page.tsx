export const metadata = { title: 'Politique de confidentialité — BRICELO' }

const sections = [
  {
    title: '1. Données collectées',
    content: `Lors de votre utilisation de BRICELO.com, nous collectons les données suivantes : informations d'identification (nom, prénom, e-mail, téléphone), données de commande (adresses, historique d'achat), données de navigation (pages visitées, cookies), et données de paiement (traitées de manière sécurisée via nos partenaires, sans stockage de vos coordonnées bancaires sur nos serveurs).`,
  },
  {
    title: '2. Utilisation des données',
    content: `Vos données sont utilisées pour : traiter et suivre vos commandes, personnaliser votre expérience d'achat, vous envoyer des confirmations et mises à jour de commande, vous informer de nos offres et promotions (avec votre consentement), améliorer nos services et prévenir la fraude.`,
  },
  {
    title: '3. Partage des données',
    content: `Nous ne vendons jamais vos données personnelles. Elles peuvent être partagées avec : les vendeurs concernés par votre commande (nom, adresse de livraison uniquement), nos partenaires logistiques pour assurer la livraison, nos partenaires de paiement (Orange Money, MTN MoMo) pour traiter vos transactions.`,
  },
  {
    title: '4. Cookies',
    content: `BRICELO utilise des cookies pour améliorer votre expérience. Les cookies essentiels sont nécessaires au fonctionnement du site. Les cookies analytiques nous aident à comprendre l'utilisation du site. Vous pouvez refuser les cookies non essentiels via votre navigateur.`,
  },
  {
    title: '5. Sécurité',
    content: `Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données : chiffrement SSL, accès restreint aux données, surveillance continue de nos systèmes.`,
  },
  {
    title: '6. Vos droits',
    content: `Vous disposez des droits suivants concernant vos données : droit d'accès et de rectification, droit à l'effacement (« droit à l'oubli »), droit à la portabilité, droit d'opposition au traitement. Pour exercer ces droits, contactez-nous à privacy@bricelo.com.`,
  },
  {
    title: '7. Conservation des données',
    content: `Vos données sont conservées pendant la durée nécessaire à la fourniture de nos services, et jusqu'à 3 ans après la fin de votre relation commerciale avec BRICELO, sauf obligation légale plus longue.`,
  },
  {
    title: '8. Contact',
    content: `Pour toute question relative à notre politique de confidentialité ou à vos données personnelles, contactez notre Délégué à la Protection des Données : privacy@bricelo.com ou BRICELO SAS, Douala, Cameroun.`,
  },
]

export default function ConfidentialitePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-navy-900)] mb-3">
          Politique de confidentialité
        </h1>
        <p className="text-sm text-[var(--color-slate-400)]">Dernière mise à jour : août 2026</p>
        <p className="text-[var(--color-slate-500)] mt-2">
          Chez BRICELO, la protection de vos données personnelles est une priorité. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
        </p>
      </div>
      <div className="flex flex-col gap-6">
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
