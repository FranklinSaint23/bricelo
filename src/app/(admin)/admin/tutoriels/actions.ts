'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface TutorialItem {
  id?: string
  title: string
  slug?: string
  description: string
  category: 'seller' | 'product' | 'payment' | 'buyer' | 'growth'
  duration: string
  thumbnail_url?: string
  video_url?: string
  steps: string[]
  position?: number
  is_published?: boolean
}

export async function getAdminTutorials() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tutorials')
    .select('*')
    .order('position', { ascending: true })

  if (error) {
    console.error('Error fetching tutorials:', error)
    return []
  }

  return data ?? []
}

export async function saveTutorial(payload: TutorialItem) {
  const supabase = await createClient()

  // Auto-génération du slug
  const slug = payload.slug || payload.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

  const record = {
    title: payload.title,
    slug,
    description: payload.description,
    category: payload.category,
    duration: payload.duration || '3 min',
    thumbnail_url: payload.thumbnail_url || 'https://images.unsplash.com/photo-1556742049-0a670fc8a5d7?w=800&q=80',
    video_url: payload.video_url || '',
    steps: payload.steps || [],
    is_published: payload.is_published ?? true,
    updated_at: new Date().toISOString()
  }

  let res
  if (payload.id) {
    res = await supabase.from('tutorials').update(record).eq('id', payload.id)
  } else {
    res = await supabase.from('tutorials').insert(record)
  }

  if (res.error) {
    throw new Error(res.error.message || 'Erreur lors de la sauvegarde du tutoriel')
  }

  revalidatePath('/apprendre-a-vendre')
  revalidatePath('/admin/tutoriels')

  return { success: true }
}

export async function toggleTutorialStatus(id: string, is_published: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('tutorials').update({ is_published }).eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/apprendre-a-vendre')
  revalidatePath('/admin/tutoriels')
  return { success: true }
}

export async function deleteTutorial(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('tutorials').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/apprendre-a-vendre')
  revalidatePath('/admin/tutoriels')
  return { success: true }
}
