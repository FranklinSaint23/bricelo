'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
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

  // Recalculer automatiquement les notes et nombres d'avis du produit et de sa boutique
  try {
    const adminClient = getAdminClient()
    const { data: allReviews } = await adminClient
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('is_visible', true)

    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      const roundedAvg = Math.round(avg * 10) / 10

      await adminClient
        .from('products')
        .update({
          rating: roundedAvg,
          review_count: allReviews.length,
        })
        .eq('id', productId)

      // Recalculer la note globale de la boutique
      const { data: prod } = await adminClient
        .from('products')
        .select('store_id')
        .eq('id', productId)
        .single()

      if (prod?.store_id) {
        const { data: storeProducts } = await adminClient
          .from('products')
          .select('rating, review_count')
          .eq('store_id', prod.store_id)
          .gt('review_count', 0)

        if (storeProducts && storeProducts.length > 0) {
          const storeAvg = storeProducts.reduce((sum, p) => sum + (p.rating ?? 5), 0) / storeProducts.length
          const totalStoreReviews = storeProducts.reduce((sum, p) => sum + (p.review_count ?? 0), 0)
          await adminClient
            .from('stores')
            .update({
              rating: Math.round(storeAvg * 10) / 10,
              review_count: totalStoreReviews,
            })
            .eq('id', prod.store_id)
        }
      }
    }
  } catch (recalcErr) {
    console.error('Erreur recalcul des notes:', recalcErr)
  }

  revalidatePath(`/produit/${slug}`)
  revalidatePath('/')
  revalidatePath('/catalogue')

  return { success: true }
}
