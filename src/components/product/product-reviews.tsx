import { Star } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  reviewer_name?: string | null
  user?: { id: string; full_name: string | null; avatar_url: string | null } | null
}

interface Props { reviews: Review[]; rating: number; count: number; children?: React.ReactNode }

export function ProductReviews({ reviews, rating, count, children }: Props) {
  return (
    <section className="mt-8 bg-white rounded-[var(--radius-2xl)] p-6 sm:p-8 border border-[var(--color-slate-200)]">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-lg font-bold text-[var(--color-navy-900)]">Avis clients</h2>
        {count > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= Math.round(rating) ? 'fill-[var(--color-accent)] text-[var(--color-accent)]' : 'text-[var(--color-slate-200)]'}`} />
              ))}
            </div>
            <span className="text-sm font-semibold text-[var(--color-navy-900)]">{rating.toFixed(1)}</span>
            <span className="text-sm text-[var(--color-slate-500)]">({count} avis)</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-[var(--color-slate-500)]">Aucun avis pour l'instant. Soyez le premier à noter ce produit.</p>
      ) : (
        <div className="flex flex-col divide-y divide-[var(--color-slate-100)]">
          {reviews.map((review) => {
            const displayName = review.reviewer_name ?? review.user?.full_name ?? 'Anonyme'
            return (
              <div key={review.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar src={review.user?.avatar_url} name={displayName} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-navy-900)]">{displayName}</p>
                    <p className="text-xs text-[var(--color-slate-400)]">{formatDate(review.created_at)}</p>
                  </div>
                  <div className="ml-auto flex">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-[var(--color-accent)] text-[var(--color-accent)]' : 'text-[var(--color-slate-200)]'}`} />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-[var(--color-slate-700)] leading-relaxed pl-11">{review.comment}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {children}
    </section>
  )
}
