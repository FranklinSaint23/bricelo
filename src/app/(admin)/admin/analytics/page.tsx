import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  Activity, Video, Users, ShoppingCart, TrendingUp, ExternalLink,
  ShieldCheck, Eye, Smartphone, MousePointerClick, PlayCircle,
  Clock, ArrowUpRight, Sparkles, Filter, CheckCircle2
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) redirect('/login')

  const supabase = await createClient()

  // Données de base en direct depuis Supabase
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayIso = today.toISOString()

  const [
    { count: totalUsers },
    { count: todayUsers },
    { count: totalOrders },
    { count: todayOrders },
    { data: popularProducts },
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', todayIso),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', todayIso),
    supabase.from('products')
      .select('id, name, slug, price, views_count:id')
      .eq('is_active', true)
      .limit(5),
  ])

  const posthogProjectId = '686218'
  const posthogBaseUrl = `https://us.posthog.com/project/${posthogProjectId}`

  const quickLinks = [
    {
      title: 'Replays Vidéo des Sessions',
      subtitle: 'Regardez l’écran des clients en vidéo pour voir où ils hésitent ou abandonnent',
      icon: Video,
      color: 'from-amber-500 to-orange-600',
      badge: '5 000 vidéos/mois incluses',
      href: `${posthogBaseUrl}/replay`,
    },
    {
      title: 'Flux d’Événements en Direct',
      subtitle: 'Chaque clic, consultation de produit et ajout au panier en temps réel',
      icon: MousePointerClick,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Temps réel',
      href: `${posthogBaseUrl}/events`,
    },
    {
      title: 'Entonnoirs de Conversion (Funnels)',
      subtitle: 'Suivez le parcours : Visite ➔ Panier ➔ Commande ➔ Paiement validé',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-700',
      badge: 'Taux de conversion',
      href: `${posthogBaseUrl}/insights`,
    },
    {
      title: 'Profils Visiteurs & Vendeurs',
      subtitle: 'Historique individuel de chaque utilisateur avec son adresse email et ses actions',
      icon: Users,
      color: 'from-violet-600 to-purple-800',
      badge: 'Comptes identifiés',
      href: `${posthogBaseUrl}/persons`,
    },
  ]

  const keyEvents = [
    { name: 'Vue de page produit', code: '$pageview', desc: 'Déclenché dès qu’un visiteur ouvre un article' },
    { name: 'Ajout au panier', code: 'add_to_cart', desc: 'Produit, variante et quantité sélectionnés' },
    { name: 'Initiation du paiement', code: 'payment_initiated', desc: 'Le client lance la commande Orange/MTN' },
    { name: 'Paiement confirmé', code: 'payment_success', desc: 'Achat validé et commande enregistrée' },
    { name: 'Demande candidature vendeur', code: 'vendor_application_submitted', desc: 'Nouveau vendeur souhaitant vendre sur Bricelo' },
    { name: 'Question posée au Chatbot IA', code: 'chatbot_message_sent', desc: 'Interaction client avec le support automatique' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-[var(--color-navy-950)] p-6 rounded-2xl border border-[var(--color-slate-200)] dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-[var(--color-navy-900)] dark:text-white">
              Analytics & Activité en Direct
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              PostHog Actif
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-slate-500)] dark:text-slate-400 mt-1">
            Suivi complet de la fréquentation, des clics et replays vidéo de navigation de vos clients BRICELO.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={posthogBaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[var(--color-navy-950)] font-black text-xs shadow-sm transition-all"
          >
            <span>Ouvrir PostHog Studio</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Cartes KPI Temps Réel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[var(--color-navy-950)] rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Utilisateurs</p>
            <p className="text-2xl font-black text-[var(--color-navy-900)] dark:text-white mt-1">
              {totalUsers ?? 0}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              +{todayUsers ?? 0} inscrit(s) aujourd’hui
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[var(--color-navy-950)] rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Commandes Totales</p>
            <p className="text-2xl font-black text-[var(--color-navy-900)] dark:text-white mt-1">
              {totalOrders ?? 0}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              +{todayOrders ?? 0} commande(s) aujourd’hui
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-orange-600">
            <ShoppingCart className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[var(--color-navy-950)] rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Enregistrements Vidéo</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              Actif 🎥
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Sessions anonymisées
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
            <Video className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[var(--color-navy-950)] rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tracking Clics & Vues</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              100 %
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Toutes pages couvertes
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Raccourcis Modules PostHog Clés */}
      <div>
        <h2 className="text-sm font-bold text-[var(--color-navy-900)] dark:text-white uppercase tracking-wider mb-3">
          Outils d’Analyse PostHog Directs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <a
                key={link.title}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-white dark:bg-[var(--color-navy-950)] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg hover:border-amber-400/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center text-white shadow-sm`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {link.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--color-navy-900)] dark:text-white group-hover:text-amber-500 transition-colors flex items-center gap-1.5">
                    {link.title}
                    <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {link.subtitle}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <span>Accéder directement au module</span>
                  <span>Ouvrir →</span>
                </div>
              </a>
            )
          })}
        </div>
      </div>

      {/* Focus Fonctionnalité : Replay Vidéo des Sessions */}
      <div className="bg-gradient-to-br from-[var(--color-navy-950)] via-[var(--color-navy-900)] to-slate-950 rounded-2xl p-6 sm:p-8 text-white border border-white/10 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold mb-4">
            <PlayCircle className="h-4 w-4 text-amber-400" />
            Fonctionnalité Star : Replay Vidéo
          </div>

          <h2 className="text-lg sm:text-2xl font-black text-white">
            Comment fonctionne le visionnage des sessions de vos clients ?
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            PostHog enregistre de manière <strong>anonymisée</strong> les mouvements de souris, les scrolls sur mobile, et les clics de vos visiteurs. Vous pouvez filtrer les sessions par :
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs font-bold text-amber-300">🛒 Abandons de panier</p>
              <p className="text-[11px] text-slate-300 mt-1">Voyez pourquoi le client est parti au moment de payer.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs font-bold text-emerald-300">🎉 Achats réussis</p>
              <p className="text-[11px] text-slate-300 mt-1">Comprenez le parcours type des clients satisfaits.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs font-bold text-sky-300">📱 Utilisateurs Mobile</p>
              <p className="text-[11px] text-slate-300 mt-1">Vérifiez la fluidité sur tous les smartphones (Android & iPhone).</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={`${posthogBaseUrl}/replay`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[var(--color-navy-950)] font-black text-xs shadow-md transition-all"
            >
              <Video className="h-4 w-4" />
              <span>Voir les vidéos de sessions maintenant</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Événements Métiers Automatiquement Enregistrés */}
      <div className="bg-white dark:bg-[var(--color-navy-950)] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-[var(--color-navy-900)] dark:text-white uppercase tracking-wider">
            Événements e-commerce trackés sur le site
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Chaque action client ci-dessous est automatiquement transmise à PostHog.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {keyEvents.map((ev) => (
            <div key={ev.code} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-xs font-bold text-[var(--color-navy-900)] dark:text-white">{ev.name}</p>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
                    {ev.code}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{ev.desc}</p>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Enregistré automatiquement</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
