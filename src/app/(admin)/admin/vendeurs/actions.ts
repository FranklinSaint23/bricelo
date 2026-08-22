'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function approveVendorApplication(applicationId: string) {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) return { error: 'Non autorisé' }

  const supabase = await createClient()
  const { data: adminUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (!adminUser || adminUser.role !== 'admin') {
    return { error: 'Action réservée aux administrateurs.' }
  }

  const adminClient = getAdminClient()

  // 1. Récupérer la candidature
  const { data: app, error: appErr } = await adminClient
    .from('vendor_applications')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (appErr || !app) return { error: 'Candidature introuvable.' }

  // 2. Mettre à jour la candidature
  await adminClient
    .from('vendor_applications')
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('id', applicationId)

  // 3. Mettre à jour le rôle de l'utilisateur s'il existe
  if (app.user_id) {
    await adminClient
      .from('users')
      .update({ role: 'vendor' })
      .eq('id', app.user_id)
  }

  // 4. Créer automatiquement la boutique dans 'stores' si elle n'existe pas encore
  if (app.user_id) {
    const { data: existingStore } = await adminClient
      .from('stores')
      .select('id')
      .eq('user_id', app.user_id)
      .maybeSingle()

    if (!existingStore) {
      let baseSlug = slugify(app.business_name || app.full_name || 'boutique')
      if (!baseSlug) baseSlug = 'boutique-' + Math.random().toString(36).substring(2, 7)

      // S'assurer que le slug est unique
      const { data: slugCheck } = await adminClient
        .from('stores')
        .select('id')
        .eq('slug', baseSlug)
        .maybeSingle()

      const finalSlug = slugCheck ? `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}` : baseSlug

      await adminClient.from('stores').insert({
        user_id: app.user_id,
        name: app.business_name || `Boutique de ${app.full_name}`,
        slug: finalSlug,
        city: app.city || 'Douala',
        description: `Boutique officielle de ${app.business_name || app.full_name}`,
        is_active: true,
        rating: 5.0,
        review_count: 0,
      })
    } else {
      // Si la boutique existait déjà (désactivée), l'activer
      await adminClient
        .from('stores')
        .update({ is_active: true })
        .eq('id', existingStore.id)
    }
  }

  revalidatePath('/admin/vendeurs')
  revalidatePath('/vendeur')
  return { success: true }
}

export async function rejectVendorApplication(applicationId: string) {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  if (!userId) return { error: 'Non autorisé' }

  const adminClient = getAdminClient()
  await adminClient
    .from('vendor_applications')
    .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
    .eq('id', applicationId)

  revalidatePath('/admin/vendeurs')
  return { success: true }
}
