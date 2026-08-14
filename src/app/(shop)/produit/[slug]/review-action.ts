'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReview(
  productId: string,
  slug: string,
  rating: number,
  comment: string,
  reviewerName: string,
) {
  if (rating < 1 || rating > 5) return { error: 'Note invalide' }
  if (!reviewerName.trim()) return { error: 'Veuillez entrer votre nom' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  async function doInsert(withName: boolean) {
    const base: Record<string, unknown> = {
      product_id: productId,
      user_id: user?.id ?? null,
      rating,
      comment: comment.trim() || null,
      is_visible: true,
    }
    if (withName) base.reviewer_name = reviewerName.trim()

    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (supabase.from('reviews') as any)
        .upsert(base, { onConflict: 'product_id,user_id' })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (supabase.from('reviews') as any).insert(base)
    }
  }

  let { error } = await doInsert(true)

  // Si la colonne reviewer_name n'existe pas encore (migration non exécutée)
  if (error && (error.message.includes('reviewer_name') || error.code === '42703')) {
    const res = await doInsert(false)
    error = res.error
  }

  if (error) return { error: error.message }

  revalidatePath(`/produit/${slug}`)
  return { success: true }
}
