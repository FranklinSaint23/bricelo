'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export async function reviewVendorApplication(
  id: string,
  status: 'approved' | 'rejected',
  adminNote?: string,
) {
  const supabase = await createClient()
  const headersList = await headers()
  const reviewerId = headersList.get('x-user-id')

  const { error } = await supabase
    .from('vendor_applications')
    .update({
      status,
      admin_note: adminNote ?? null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId ?? null,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/vendeurs')
  return { success: true }
}
