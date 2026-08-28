'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  GraduationCap, Play, CheckCircle2, Store, PlusCircle,
  CreditCard, ShieldCheck, TrendingUp, Sparkles, X, ChevronRight,
  Video, HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

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

function getEmbedVideoUrl(url?: string): string | null {
  if (!url || !url.trim()) return null
  const cleaned = url.trim()

  // YouTube Links (watch?v=, youtu.be/, shorts/, embed/)
  if (cleaned.includes('youtube.com') || cleaned.includes('youtu.be')) {
    let videoId = ''

    if (cleaned.includes('youtu.be/')) {
      videoId = cleaned.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0] || ''
    } else if (cleaned.includes('youtube.com/shorts/')) {
      videoId = cleaned.split('youtube.com/shorts/')[1]?.split('?')[0]?.split('&')[0] || ''
    } else if (cleaned.includes('youtube.com/embed/')) {
      videoId = cleaned.split('youtube.com/embed/')[1]?.split('?')[0]?.split('&')[0] || ''
    } else if (cleaned.includes('youtube.com/watch')) {
      const match = cleaned.match(/[?&]v=([^&]+)/)
      if (match) videoId = match[1]
    }

    if (videoId) {
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
    }
  }

  // Vimeo Links
  if (cleaned.includes('vimeo.com/')) {
    const vimeoId = cleaned.split('vimeo.com/')[1]?.split('?')[0]?.split('/')[0]
    if (vimeoId) {
      return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`
    }
  }

  return cleaned
}

export default function LearnToSellPage() {
  const [courses, setCourses] = useState<VideoCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'seller' | 'product' | 'payment' | 'buyer' | 'growth'>('all')
  const [selectedCourse, setSelectedCourse] = useState<VideoCourse | null>(null)
  const [isPlayingVideo, setIsPlayingVideo] = useState(false)

  useEffect(() => {
    async function loadDynamicTutorials() {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('tutorials')
          .select('*')
          .eq('is_published', true)
          .order('position', { ascending: true })

        if (!error && data) {
          const mapped: VideoCourse[] = data.map((t: any) => ({
            id: t.id,
            title: t.title,
            category: t.category,
            duration: t.duration || '3 min',
            thumbnail: t.thumbnail_url || 'https://images.unsplash.com/photo-1556742049-0a670fc8a5d7?w=800&q=80',
            videoUrl: t.video_url,
            description: t.description,
            steps: Array.isArray(t.steps) ? t.steps : []
          }))
          setCourses(mapped)
        }
      } catch (err) {
        console.error('Error loading tutorials:', err)
      } finally {
        setLoading(false)
      }
    }
    loadDynamicTutorials()
  }, [])

  const filteredCourses = activeTab === 'all'
    ? courses
    : courses.filter((c) => c.category === activeTab)

  const embedUrl = selectedCourse ? getEmbedVideoUrl(selectedCourse.videoUrl) : null
  const isDirectVideo = selectedCourse?.videoUrl?.endsWith('.mp4') || selectedCourse?.videoUrl?.endsWith('.webm')

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
            { id: 'seller', label: 'S’inscrire & Boutique' },
            { id: 'product', label: 'Produits & Stocks' },
            { id: 'payment', label: 'Paiements & Retraits' },
            { id: 'buyer', label: 'Guide Acheteur' },
            { id: 'growth', label: 'Astuces de Ventes' },
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

        {/* ── 3. Grille des Cours Vidéo (Dynamique Supabase) ── */}
        {loading ? (
          <div className="p-16 text-center text-sm font-semibold text-slate-500">
            Chargement des formations vidéo...
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-md mx-auto space-y-3 mt-8 shadow-xs">
            <Video className="h-10 w-10 text-amber-500 mx-auto" />
            <p className="font-bold text-slate-900">Aucun tutoriel disponible pour le moment</p>
            <p className="text-xs text-slate-500">
              L’administrateur publiera prochainement de nouveaux tutoriels vidéo et guides pratiques sur cette plateforme.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => {
                  setSelectedCourse(course)
                  setIsPlayingVideo(false)
                }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-[var(--color-slate-200)] dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group flex flex-col justify-between"
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
                    <h3 className="text-base font-bold text-[var(--color-navy-900)] dark:text-slate-100 leading-snug group-hover:text-amber-500 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-[var(--color-slate-500)] dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-4 pt-2 border-t border-[var(--color-slate-100)] dark:border-slate-800 flex items-center justify-between text-xs font-bold text-amber-500">
                  <span>Lancer la vidéo de formation</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. Modal de Lecteur Vidéo Intégré ── */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in duration-150 border border-slate-200 dark:border-slate-800">
            {/* Header Modal */}
            <div className="bg-[var(--color-navy-950)] text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">Tutoriel Vidéo & Guide Pratique</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedCourse(null)
                  setIsPlayingVideo(false)
                }}
                className="p-1.5 rounded-xl text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 transition-all font-bold"
                title="Fermer la vidéo"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Corps Modal */}
            <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <h2 className="text-lg sm:text-xl font-extrabold text-[var(--color-navy-900)] dark:text-amber-400">
                {selectedCourse.title}
              </h2>

              {/* LECTEUR VIDÉO INTÉGRÉ (DIRECT SUR LA PLATEFORME) */}
              <div className="relative aspect-video rounded-xl bg-slate-950 overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center">
                {isPlayingVideo ? (
                  embedUrl && !isDirectVideo ? (
                    <iframe
                      src={embedUrl}
                      title={selectedCourse.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      controls
                      autoPlay
                      src={embedUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <>
                    <img
                      src={selectedCourse.thumbnail}
                      alt={selectedCourse.title}
                      className="w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
                      <button
                        type="button"
                        onClick={() => setIsPlayingVideo(true)}
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95 group"
                        title="Lancer la vidéo"
                      >
                        <Play className="h-8 w-8 sm:h-10 sm:w-10 fill-current ml-1 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[var(--color-slate-600)] dark:text-slate-200 font-medium leading-relaxed">
                {selectedCourse.description}
              </p>

              {/* Liste des Étapes Pratiques */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-amber-400 mb-3">
                  Résumé des Étapes à Suivre :
                </h4>
                <div className="space-y-2.5">
                  {selectedCourse.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs">
                      <span className="h-6 w-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-bold text-[var(--color-navy-900)] dark:text-slate-100 leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                className="dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700 font-bold"
                onClick={() => {
                  setSelectedCourse(null)
                  setIsPlayingVideo(false)
                }}
              >
                Fermer
              </Button>
              <Button asChild size="sm" className="bg-amber-400 text-slate-950 hover:bg-amber-500 font-extrabold shadow-sm">
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
