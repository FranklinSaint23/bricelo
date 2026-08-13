import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const headersList = await headers()
  const userId = headersList.get('x-user-id')

  let navUser: { full_name: string | null; avatar_url: string | null; role: string } | null = null

  if (userId) {
    const { data: profile } = await supabase
      .from('users')
      .select('full_name, avatar_url, role')
      .eq('id', userId)
      .single()
    navUser = profile ?? null
  }

  return (
    <>
      <Navbar user={navUser} />
      <main className="flex-1 bg-[var(--color-slate-100)]">
        {children}
      </main>
      <Footer />
    </>
  )
}
