import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { CategoryAdmin } from '@/components/admin/category-admin'

export const metadata = { title: 'Catégories — Administration' }

export default async function AdminCategoriesPage() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) redirect('/login')

  const supabase = await createClient()

  const [{ data: categories }, { data: rawCounts }] = await Promise.all([
    supabase.from('categories').select('id, name, slug, image_url, created_at').order('name'),
    supabase.from('products').select('category_id').eq('is_active', true),
  ])

  const countMap: Record<string, number> = {}
  rawCounts?.forEach(p => {
    if (p.category_id) countMap[p.category_id] = (countMap[p.category_id] ?? 0) + 1
  })

  return <CategoryAdmin categories={categories ?? []} countMap={countMap} />
}
