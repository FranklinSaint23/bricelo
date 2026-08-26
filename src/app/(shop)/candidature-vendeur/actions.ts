'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export interface VendorApplicationPayload {
  full_name: string
  email: string
  phone: string
  password?: string
  gender: string
  birth_date: string
  business_name: string
  business_type: string
  city: string
  address: string
  has_cni: boolean
  has_registre_commerce: boolean
  has_carte_contribuable: boolean
  has_plan_localisation: boolean
  has_patente: boolean
  has_licence_exploitation: boolean
}

export async function submitVendorApplication(data: VendorApplicationPayload) {
  const supabase = await createClient()
  const adminClient = getAdminClient()

  let userId: string | null = null

  // 1. Si un mot de passe est fourni, créer le compte utilisateur
  if (data.password && data.password.trim().length >= 8) {
    const cleanEmail = data.email.trim().toLowerCase()

    // Vérifier si l'utilisateur existe déjà dans 'users'
    const { data: existingUser } = await adminClient
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (existingUser?.id) {
      const uId = existingUser.id
      userId = uId
      // Mettre à jour le rôle en vendor et mettre à jour le mot de passe
      await adminClient.auth.admin.updateUserById(uId, { password: data.password.trim() })
      await adminClient.from('users').update({
        role: 'vendor',
        full_name: data.full_name.trim(),
        phone: data.phone.trim(),
      }).eq('id', uId)
    } else {
      // Créer le compte utilisateur dans Auth
      const { data: authRes, error: createErr } = await adminClient.auth.admin.createUser({
        email: cleanEmail,
        password: data.password.trim(),
        email_confirm: true,
        user_metadata: {
          full_name: data.full_name.trim(),
          phone: data.phone.trim(),
          role: 'vendor',
        },
      })

      if (createErr) {
        return { error: `Erreur lors de la création du compte: ${createErr.message}` }
      }

      if (authRes?.user) {
        userId = authRes.user.id
        // Assurer la création de la ligne dans public.users
        await adminClient.from('users').upsert({
          id: userId,
          email: cleanEmail,
          full_name: data.full_name.trim(),
          phone: data.phone.trim(),
          role: 'vendor',
        })
      }
    }
  }

  // 2. Insérer la candidature dans 'vendor_applications'
  const { password, ...applicationData } = data

  const { error } = await supabase.from('vendor_applications').insert({
    ...applicationData,
    user_id: userId,
    status: 'pending',
  })

  if (error) return { error: error.message }
  return { success: true }
}
