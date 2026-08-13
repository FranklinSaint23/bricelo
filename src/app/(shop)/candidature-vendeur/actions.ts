'use server'

import { createClient } from '@/lib/supabase/server'

export interface VendorApplicationPayload {
  full_name: string
  email: string
  phone: string
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
  const { error } = await supabase.from('vendor_applications').insert({
    ...data,
    status: 'pending',
  })
  if (error) return { error: error.message }
  return { success: true }
}
