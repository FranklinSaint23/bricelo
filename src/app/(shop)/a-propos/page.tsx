'use client'

import { ShieldCheck, Truck, Users, Star, TrendingUp, Heart } from 'lucide-react'
import Image from 'next/image'
import { useLanguage } from '@/components/providers/language-provider'

export default function AProposPage() {
  const { lang } = useLanguage()
  const fr = lang === 'fr'

  const values = fr ? [
    { Icon: ShieldCheck, title: 'Confiance',   desc: 'Tous nos vendeurs sont vérifiés. Chaque produit est contrôlé avant mise en ligne.' },
    { Icon: Truck,       title: 'Rapidité',    desc: 'Livraison en 3h à Douala & Yaoundé. Partout au Cameroun sous 1 à 4 jours.' },
    { Icon: Heart,       title: 'Proximité',   desc: "Made in Cameroun. Nous soutenons les commerces locaux et l'économie nationale." },
    { Icon: Star,        title: 'Qualité',     desc: 'Nous exigeons des standards élevés de nos vendeurs pour garantir votre satisfaction.' },
    { Icon: TrendingUp,  title: 'Croissance',  desc: 'Nous aidons les PME camerounaises à vendre en ligne et à accroître leur visibilité.' },
    { Icon: Users,       title: 'Communauté',  desc: 'Plus de 10 000 acheteurs et 500 vendeurs font confiance à BRICELO chaque mois.' },
  ] : [
    { Icon: ShieldCheck, title: 'Trust',       desc: 'All our sellers are verified. Every product is reviewed before going live.' },
    { Icon: Truck,       title: 'Speed',       desc: '3-hour delivery in Douala & Yaoundé. Nationwide in 1 to 4 days.' },
    { Icon: Heart,       title: 'Closeness',   desc: 'Made in Cameroon. We support local businesses and the national economy.' },
    { Icon: Star,        title: 'Quality',     desc: 'We hold our sellers to high standards to guarantee your satisfaction.' },
    { Icon: TrendingUp,  title: 'Growth',      desc: 'We help Cameroonian SMEs sell online and grow their visibility.' },
    { Icon: Users,       title: 'Community',   desc: 'More than 10,000 buyers and 500 sellers trust BRICELO every month.' },
  ]

  const team = fr ? [
    { name: 'Équipe Produit',    role: 'Développement & Design',   city: 'Douala' },
    { name: 'Équipe Logistique', role: 'Livraison & Partenariats', city: 'Yaoundé' },
    { name: 'Équipe Support',    role: 'Service client 7j/7',      city: 'Douala' },
    { name: 'Équipe Vendeurs',   role: 'Onboarding & Formation',   city: 'Douala & Yaoundé' },
  ] : [
    { name: 'Product Team',     role: 'Development & Design',     city: 'Douala' },
    { name: 'Logistics Team',   role: 'Delivery & Partnerships',  city: 'Yaoundé' },
    { name: 'Support Team',     role: 'Customer service 7/7',     city: 'Douala' },
    { name: 'Seller Team',      role: 'Onboarding & Training',    city: 'Douala & Yaoundé' },
  ]

  const stats = fr ? [
    { val: '10 000+', label: 'Acheteurs actifs' },
    { val: '500+',    label: 'Vendeurs vérifiés' },
    { val: '25 000+', label: 'Produits en ligne' },
    { val: '7j/7',    label: 'Support disponible' },
  ] : [
    { val: '10,000+', label: 'Active buyers' },
    { val: '500+',    label: 'Verified sellers' },
    { val: '25,000+', label: 'Products online' },
    { val: '7/7',     label: 'Support available' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <title>{fr ? 'Qui sommes-nous — BRICELO' : 'About us — BRICELO'}</title>

      <div className="text-center mb-14">
        <div className="flex justify-center mb-6">
          <Image src="/logo.jpeg" alt="BRICELO" width={120} height={120} className="h-24 w-auto object-contain" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-navy-900)] mb-4">
          {fr ? 'La marketplace N°1 du Cameroun' : 'Cameroon\'s #1 Marketplace'}
        </h1>
        <p className="text-[var(--color-slate-500)] text-lg max-w-2xl mx-auto leading-relaxed">
          {fr
            ? "BRICELO.com est une plateforme de commerce en ligne camerounaise qui connecte acheteurs et vendeurs locaux. Notre mission : rendre le commerce en ligne accessible, simple et sécurisé pour tous."
            : "BRICELO.com is a Cameroonian e-commerce platform connecting local buyers and sellers. Our mission: make online commerce accessible, simple and secure for everyone."}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
        {stats.map(({ val, label }) => (
          <div key={label} className="bg-[var(--color-navy-900)] text-white rounded-2xl p-5 text-center">
            <p className="text-2xl font-extrabold text-[var(--color-accent)]">{val}</p>
            <p className="text-xs text-white/65 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[var(--color-slate-200)] rounded-2xl p-6 sm:p-8 mb-10 shadow-sm">
        <h2 className="text-xl font-extrabold text-[var(--color-navy-900)] mb-4">
          {fr ? 'Notre histoire' : 'Our story'}
        </h2>
        <div className="prose prose-sm text-[var(--color-slate-600)] max-w-none space-y-3 text-sm leading-relaxed">
          {fr ? (
            <>
              <p>BRICELO est né de la volonté de démocratiser le commerce en ligne au Cameroun. Face aux difficultés rencontrées par les commerçants locaux — manque de visibilité, absence de plateforme fiable, logistique complexe — notre équipe a décidé de créer une solution adaptée aux réalités du marché camerounais.</p>
              <p>Depuis notre lancement, nous avons accompagné des centaines de vendeurs dans leur digitalisation, leur offrant des outils simples pour gérer leurs boutiques en ligne, leurs stocks et leurs commandes. Nous avons aussi mis en place un réseau logistique local garantissant des livraisons rapides partout dans le pays.</p>
              <p>Aujourd'hui, BRICELO est la référence du e-commerce au Cameroun, avec une croissance constante et une communauté engagée d'acheteurs et de vendeurs qui nous font confiance chaque jour.</p>
            </>
          ) : (
            <>
              <p>BRICELO was born from a desire to democratise e-commerce in Cameroon. Faced with the challenges encountered by local traders — lack of visibility, absence of reliable platforms, complex logistics — our team decided to create a solution tailored to the realities of the Cameroonian market.</p>
              <p>Since our launch, we have supported hundreds of sellers in their digital transition, offering them simple tools to manage their online stores, inventory and orders. We also built a local logistics network guaranteeing fast deliveries across the country.</p>
              <p>Today, BRICELO is the reference for e-commerce in Cameroon, with steady growth and an engaged community of buyers and sellers who trust us every day.</p>
            </>
          )}
        </div>
      </div>

      <h2 className="text-xl font-extrabold text-[var(--color-navy-900)] mb-6">
        {fr ? 'Nos valeurs' : 'Our values'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
        {values.map(({ Icon, title, desc }) => (
          <div key={title} className="bg-white border border-[var(--color-slate-200)] rounded-2xl p-5 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-[var(--color-accent)]/15 flex items-center justify-center mb-3">
              <Icon className="h-5 w-5 text-[var(--color-navy-900)]" />
            </div>
            <p className="font-bold text-[var(--color-navy-900)] mb-1">{title}</p>
            <p className="text-sm text-[var(--color-slate-500)] leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-extrabold text-[var(--color-navy-900)] mb-6">
        {fr ? 'Notre équipe' : 'Our team'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {team.map((member) => (
          <div key={member.name} className="bg-[var(--color-slate-50)] border border-[var(--color-slate-200)] rounded-2xl p-5">
            <p className="font-bold text-[var(--color-navy-900)]">{member.name}</p>
            <p className="text-sm text-[var(--color-slate-500)]">{member.role}</p>
            <p className="text-xs text-[var(--color-accent)] font-semibold mt-1">{member.city}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
