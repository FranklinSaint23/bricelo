'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  GraduationCap, Play, CheckCircle2, Store, PlusCircle,
  CreditCard, ShieldCheck, TrendingUp, Sparkles, X, ChevronRight,
  Video, HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VideoCourse {
  id: string
  title: string
  category: 'seller' | 'product' | 'payment' | 'buyer' | 'growth'
  duration: string
  thumbnail: string
  videoUrl?: string
  description: string
  steps: string[]
}

const COURSES: VideoCourse[] = [
  {
    id: 's-inscrire-vendeur',
    title: "Comment s'inscrire comme Vendeur & ouvrir sa boutique",
    category: 'seller',
    duration: '3 min',
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0a670fc8a5d7?w=800&q=80',
    description: "Apprenez pas à pas comment remplir le formulaire d'inscription vendeur, personnaliser le nom de votre boutique, ajouter votre logo et obtenir votre badge certifié.",
    steps: [
      "Cliquez sur 'Devenir Vendeur' sur BRICÉLO.com.",
      "Renseignez le nom de votre commerce, numéro WhatsApp et mot de passe.",
      "Téléversez votre logo et votre bannière de boutique.",
      "Votre boutique est immédiatement active et prête à recevoir des clients !"
    ]
  },
  {
    id: 'ajouter-un-produit',
    title: 'Comment ajouter un produit avec ses variantes (Prix & Tailles)',
    category: 'product',
    duration: '4 min',
    thumbnail: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
    description: "Découvrez la méthode simple pour créer une fiche produit attrayante avec photos HD, prix de vente, réductions et déclinaisons de stock (couleurs, pointures, tailles).",
    steps: [
      "Allez dans votre Tableau de Bord > 'Mes Produits' > 'Ajouter un produit'.",
      "Ajoutez le titre, la description et plusieurs belles images réelles.",
      "Activez la Matrice des Variantes pour configurer vos tailles et stocks.",
      "Cliquez sur 'Publier' : votre produit est en ligne dans le catalogue mondial !"
    ]
  },
  {
    id: 'traiter-les-commandes',
    title: 'Comment gérer ses stocks et expédier les commandes clients',
    category: 'product',
    duration: '3 min',
    thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    description: "Comment recevoir une notification en direct dès qu'un client passe commande, emballer le colis et confier la livraison à BRICÉLO Express.",
    steps: [
      "Consultez votre onglet 'Commandes reçues' dans l'espace vendeur.",
      "Vérifiez l'adresse de livraison et préparez le colis.",
      "Cliquez sur 'Prêt pour ramassage BRICELO'.",
      "Notre livreur passe à votre boutique récupérer le colis et l'apporte au client."
    ]
  },
  {
    id: 'recevoir-paiements',
    title: 'Comment encaisser son argent (Orange Money, MTN MoMo & Virement)',
    category: 'payment',
    duration: '2 min',
    thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80',
    description: "Comprenez le fonctionnement des encaissements sécurisés et des retraits automatiques vers vos comptes Mobile Money ou bancaires.",
    steps: [
      "Le client paye en ligne par Mobile Money ou à la livraison.",
      "Les fonds sont sécurisés sur votre solde vendeur BRICÉLO.",
      "Demandez un virement vers votre numéro Mobile Money en 1 clic.",
      "L'argent est immédiatement disponible sur votre téléphone !"
    ]
  },
  {
    id: 'acheter-en-securite',
    title: 'Comment acheter en toute sécurité sur internet',
    category: 'buyer',
    duration: '3 min',
    thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
    description: "Guide pour les acheteurs : reconnaître les vendeurs vérifiés avec le badge bleu, lire les avis des autres clients et suivre son colis jusqu'au domicile.",
    steps: [
      "Cherchez vos produits favoris dans le catalogue ou via la barre de recherche.",
      "Sélectionnez vos variantes (couleur, taille, quantité).",
      "Remplissez votre adresse et choisissez d'être livré à domicile.",
      "Suivez la progression de votre livreur en temps réel sur le site."
    ]
  },
  {
    id: 'booster-ses-ventes',
    title: 'Les astuces secrètes pour multiplier ses ventes par 5',
    category: 'growth',
    duration: '5 min',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    description: "Nos conseils d'experts pour réussir dans l'e-commerce : photos de qualité sur fond clair, descriptions claires, prix barrés attractifs et réponses rapides sur WhatsApp.",
    steps: [
      "Mettez toujours une photo de couverture lumineuse et nette.",
      "Proposez des prix barrés et réductions limitées dans le temps.",
      "Partagez le lien direct de votre boutique BRICÉLO sur Facebook et WhatsApp.",
      "Offrez un service client irréprochable pour cumuler 5 étoiles sur vos avis."
    ]
  }
]

export default function LearnToSellPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'seller' | 'product' | 'payment' | 'buyer' | 'growth'>('all')
  const [selectedCourse, setSelectedCourse] = useState<VideoCourse | null>(null)

  const filteredCourses = activeTab === 'all'
    ? COURSES
    : COURSES.filter((c) => c.category === activeTab)

  return (
    <div className="min-h-screen bg-[var(--color-slate-50)] pb-20">
      {/* ── 1. Hero Section ── */}
      <section className="bg-[var(--color-navy-950)] text-white py-12 sm:py-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-extrabold text-xs uppercase tracking-wider mb-4 border border-amber-400/30">
              <GraduationCap className="h-4 w-4 text-amber-400" />
              Académie E-Commerce & Ventes en Ligne
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
              Apprenez à Vendre & Acheter en Ligne en Toute Simplicité
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              Des tutoriels vidéo guidés pour tout comprendre sur l’e-commerce : création de boutique, mise en ligne de produits, encaissement des paiements et astuces pour développer votre chiffre d’affaires.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/devenir-vendeur"
              className="h-12 px-6 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm shadow-xl transition-transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Store className="h-4 w-4" />
              <span>Ouvrir une boutique maintenant</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. Filtres par Thématique ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'all', label: 'Tous les tutoriels' },
            { id: 'seller', label: '🚀 S’inscrire & Boutique' },
            { id: 'product', label: '📦 Produits & Stocks' },
            { id: 'payment', label: '💳 Paiements & Retraits' },
            { id: 'buyer', label: '🛒 Guide Acheteur' },
            { id: 'growth', label: '🔥 Astuces de Ventes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--color-navy-900)] text-white shadow-md'
                  : 'bg-white text-[var(--color-slate-700)] border border-[var(--color-slate-200)] hover:bg-[var(--color-slate-100)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── 3. Grille des Cours Vidéo ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className="bg-white rounded-2xl border border-[var(--color-slate-200)] overflow-hidden shadow-xs hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Vignette Vidéo */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="h-5 w-5 fill-current ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] font-bold">
                    {course.duration}
                  </span>
                </div>

                {/* Détails du Tuto */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-[var(--color-navy-900)] leading-snug group-hover:text-amber-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[var(--color-slate-500)] mt-2 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-4 pt-2 border-t border-[var(--color-slate-100)] flex items-center justify-between text-xs font-bold text-amber-600">
                <span>Voir le cours étape par étape</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Modal de Cours Détaillé ── */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-150 border border-slate-200">
            {/* Header Modal */}
            <div className="bg-[var(--color-navy-950)] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold">Tutoriel Vidéo & Guide Pratique</h3>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Corps Modal */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <h2 className="text-xl font-extrabold text-[var(--color-navy-900)]">
                {selectedCourse.title}
              </h2>
              <p className="text-sm text-[var(--color-slate-600)] leading-relaxed">
                {selectedCourse.description}
              </p>

              {/* Lecteur Vidéo / Simulation */}
              <div className="relative aspect-video rounded-xl bg-slate-900 overflow-hidden shadow-inner flex items-center justify-center">
                <img
                  src={selectedCourse.thumbnail}
                  alt={selectedCourse.title}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute flex flex-col items-center gap-3">
                  <div className="h-16 w-16 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 transition-transform">
                    <Play className="h-7 w-7 fill-current ml-1" />
                  </div>
                  <span className="text-xs font-bold text-white bg-black/60 px-3 py-1 rounded-full">
                    Lecture vidéo ({selectedCourse.duration})
                  </span>
                </div>
              </div>

              {/* Liste des Étapes Pratiques */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
                  Guide Étape par Étape :
                </h4>
                <div className="space-y-2.5">
                  {selectedCourse.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="h-6 w-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-semibold text-[var(--color-navy-900)] leading-snug">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <Button variant="outline" size="sm" onClick={() => setSelectedCourse(null)}>
                Fermer
              </Button>
              <Button asChild size="sm" className="bg-amber-400 text-slate-950 hover:bg-amber-500 font-extrabold">
                <Link href="/devenir-vendeur">
                  Ouvrir ma boutique maintenant
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
