export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { HeroBanner } from '@/components/home/hero-banner'
import { CategoryBar } from '@/components/home/category-bar'
import { HomeProducts } from '@/components/home/home-products'
import { ReviewsBanner } from '@/components/home/reviews-banner'
import { RecentlyViewed } from '@/components/home/recently-viewed'
import { ChatbotWidget } from '@/components/chatbot/chatbot-widget'

export default async function HomePage() {
  const supabase = await createClient()
  const headersList = await headers()
  const userId = headersList.get('x-user-id')

  let profile: { full_name: string | null; avatar_url: string | null; role: string } | null = null
  if (userId) {
    const { data } = await supabase
      .from('users')
      .select('full_name, avatar_url, role')
      .eq('id', userId)
      .single()
    if (data) {
      profile = data
    }
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, image_url')
    .is('parent_id', null)
    .order('name')
    .limit(16)

  // Produits en vedette (section promo)
  const { data: featured } = await supabase
    .from('products')
    .select('id, name, slug, price, compare_at_price, promo_ends_at, images, rating, review_count, stock, is_featured, promotion_label, is_new, store:stores(id, name, slug), variants:product_variants(id, price, compare_at_price, stock_quantity, direct_price, price_adjustment, created_at, images:variant_images(url))')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(10)

  // Tous les produits (grille principale)
  const { data: allProducts } = await supabase
    .from('products')
    .select('id, name, slug, price, compare_at_price, promo_ends_at, images, rating, review_count, stock, is_featured, promotion_label, is_new, store:stores(id, name, slug), variants:product_variants(id, price, compare_at_price, stock_quantity, direct_price, price_adjustment, created_at, images:variant_images(url))')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(40)

  // Produits en promo (compare_at_price défini)
  const { data: promoProducts } = await supabase
    .from('products')
    .select('id, name, slug, price, compare_at_price, promo_ends_at, images, rating, review_count, stock, promotion_label, is_new, store:stores(id, name, slug), variants:product_variants(id, price, compare_at_price, stock_quantity, direct_price, price_adjustment, created_at, images:variant_images(url))')
    .eq('is_active', true)
    .not('compare_at_price', 'is', null)
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <>
      <Navbar user={profile} />
      <main className="flex-1 bg-[var(--color-slate-100)]">
        <HeroBanner />

        {/* Barre catégories sticky */}
        <Suspense fallback={null}>
          <CategoryBar categories={categories ?? []} />
        </Suspense>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 flex flex-col gap-10">
          <HomeProducts
            featuredProducts={(featured ?? []) as any}
            allProducts={(allProducts ?? []) as any}
            promoProducts={(promoProducts ?? []) as any}
          />
        </div>
      </main>
      <ReviewsBanner />
      <RecentlyViewed />
      <Footer />
      <ChatbotWidget />
    </>
  )
}
