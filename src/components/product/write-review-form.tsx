'use client'

import { useState, useTransition } from 'react'
import { Star, Check, AlertCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { submitReview } from '@/app/(shop)/produit/[slug]/review-action'

interface Props {
  productId: string
  slug: string
  existingReview?: { rating: number; comment: string | null } | null
  defaultName?: string
}

export function WriteReviewForm({ productId, slug, existingReview, defaultName = '' }: Props) {
  const [rating, setRating]           = useState(existingReview?.rating ?? 0)
  const [hovered, setHovered]         = useState(0)
  const [comment, setComment]         = useState(existingReview?.comment ?? '')
  const [reviewerName, setReviewerName] = useState(defaultName)
  const [success, setSuccess]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [isPending, start]            = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setError('Veuillez sélectionner une note.'); return }
    if (!reviewerName.trim()) { setError('Veuillez entrer votre nom.'); return }
    setError(null)
    start(async () => {
      const res = await submitReview(productId, slug, rating, comment, reviewerName)
      if ('error' in res) { setError(res.error ?? 'Erreur'); return }
      setSuccess(true)
    })
  }

  if (success) {
    return (
      <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 p-5 flex items-center gap-3">
        <Check className="h-5 w-5 text-emerald-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">Merci pour votre avis, {reviewerName} !</p>
          <p className="text-xs text-emerald-600">Il sera visible après validation.</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-[var(--color-slate-200)] bg-[var(--color-slate-50)] p-5 flex flex-col gap-4">
      <h3 className="font-semibold text-[var(--color-navy-900)] text-sm">
        {existingReview ? 'Modifier votre avis' : 'Donner votre avis'}
      </h3>

      {/* Nom du rédacteur */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-[var(--color-slate-500)] flex items-center gap-1">
          <User className="h-3.5 w-3.5" /> Votre nom *
        </label>
        <input
          type="text"
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          placeholder="Ex: Marie N., Jean-Paul K."
          required
          className="h-10 px-3 text-sm border border-[var(--color-slate-300)] rounded-lg focus:outline-none focus:border-[var(--color-navy-900)] bg-white text-[var(--color-navy-900)] placeholder:text-[var(--color-slate-400)]"
        />
      </div>

      {/* Étoiles cliquables */}
      <div>
        <p className="text-xs font-semibold text-[var(--color-slate-500)] mb-2">Votre note *</p>
        <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              onMouseEnter={() => setHovered(s)}
              className="transition-transform hover:scale-110 active:scale-95"
              aria-label={`${s} étoile${s > 1 ? 's' : ''}`}
            >
              <Star
                className={cn(
                  'h-7 w-7 transition-colors',
                  s <= (hovered || rating)
                    ? 'fill-[var(--color-accent)] text-[var(--color-accent)]'
                    : 'text-[var(--color-slate-300)] fill-[var(--color-slate-200)]',
                )}
              />
            </button>
          ))}
          {(hovered || rating) > 0 && (
            <span className="ml-2 self-center text-sm font-semibold text-[var(--color-navy-900)]">
              {['', 'Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent !'][hovered || rating]}
            </span>
          )}
        </div>
      </div>

      {/* Commentaire */}
      <div>
        <label className="text-xs font-semibold text-[var(--color-slate-500)] mb-1 block">
          Votre commentaire (facultatif)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Décrivez votre expérience avec ce produit…"
          className="w-full px-3 py-2 text-sm border border-[var(--color-slate-300)] rounded-lg resize-none focus:outline-none focus:border-[var(--color-navy-900)] bg-white text-[var(--color-navy-900)] placeholder:text-[var(--color-slate-400)]"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="self-start h-10 px-6 rounded-lg bg-[var(--color-navy-900)] text-white text-sm font-semibold hover:bg-[var(--color-navy-950)] disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Envoi…' : existingReview ? 'Mettre à jour' : 'Publier mon avis'}
      </button>
    </form>
  )
}
