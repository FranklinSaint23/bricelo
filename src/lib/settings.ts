import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export interface PaymentSettings {
  orange_money: boolean
  mtn_momo: boolean
  notice_message: string
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  orange_money: false,
  mtn_momo: false,
  notice_message: 'Paiement indisponible pour le moment',
}

/**
 * Récupère la configuration des paiements en ligne depuis Supabase
 */
export async function getPaymentSettings(): Promise<PaymentSettings> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'online_payments_settings')
      .maybeSingle()

    if (error || !data || !data.value) {
      // Fallback avec le client Admin si le RLS bloquait ou si la ligne n'est pas trouvée
      const adminClient = getAdminClient()
      const { data: adminData } = await adminClient
        .from('system_settings')
        .select('value')
        .eq('key', 'online_payments_settings')
        .maybeSingle()

      if (adminData?.value) {
        return {
          orange_money: Boolean(adminData.value.orange_money),
          mtn_momo: Boolean(adminData.value.mtn_momo),
          notice_message: adminData.value.notice_message || DEFAULT_PAYMENT_SETTINGS.notice_message,
        }
      }

      return DEFAULT_PAYMENT_SETTINGS
    }

    return {
      orange_money: Boolean(data.value.orange_money),
      mtn_momo: Boolean(data.value.mtn_momo),
      notice_message: data.value.notice_message || DEFAULT_PAYMENT_SETTINGS.notice_message,
    }
  } catch (err) {
    console.error('[getPaymentSettings] Erreur de lecture des paramètres:', err)
    return DEFAULT_PAYMENT_SETTINGS
  }
}

/**
 * Met à jour la configuration des paiements en ligne (Réservé aux administrateurs)
 */
export async function updatePaymentSettings(settings: PaymentSettings): Promise<boolean> {
  try {
    const adminClient = getAdminClient()
    const { error } = await adminClient
      .from('system_settings')
      .upsert(
        {
          key: 'online_payments_settings',
          value: {
            orange_money: Boolean(settings.orange_money),
            mtn_momo: Boolean(settings.mtn_momo),
            notice_message: settings.notice_message.trim() || DEFAULT_PAYMENT_SETTINGS.notice_message,
          },
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      )

    if (error) {
      console.error('[updatePaymentSettings] Erreur lors de la mise à jour:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('[updatePaymentSettings] Exception:', err)
    return false
  }
}
