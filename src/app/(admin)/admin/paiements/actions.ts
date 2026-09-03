'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { updatePaymentSettings, PaymentSettings } from '@/lib/settings'

export async function updatePaymentSettingsAction(formData: {
  orange_money: boolean
  mtn_momo: boolean
  notice_message: string
}) {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    const supabase = await createClient()
    
    // Si x-user-id n'est pas fourni, essayer auth.getUser()
    let currentUserId = userId
    if (!currentUserId) {
      const { data: { user } } = await supabase.auth.getUser()
      currentUserId = user?.id ?? null
    }

    if (!currentUserId) {
      return { error: 'Non autorisé. Veuillez vous connecter.' }
    }

    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUserId)
      .single()

    if (!currentUser || currentUser.role !== 'admin') {
      return { error: 'Accès refusé. Seuls les administrateurs peuvent modifier ces paramètres.' }
    }

    const success = await updatePaymentSettings({
      orange_money: formData.orange_money,
      mtn_momo: formData.mtn_momo,
      notice_message: formData.notice_message || 'Paiement indisponible pour le moment',
    })

    if (!success) {
      return { error: 'Erreur lors de la sauvegarde de la configuration.' }
    }

    revalidatePath('/admin/paiements')
    revalidatePath('/checkout')
    revalidatePath('/paiement')

    return { success: true }
  } catch (err: any) {
    return { error: err?.message || 'Erreur inattendue lors de la mise à jour.' }
  }
}
