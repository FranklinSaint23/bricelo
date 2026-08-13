'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function createCategory(formData: FormData) {
  const name = (formData.get('name') as string).trim()
  if (!name) return { error: 'Le nom est obligatoire' }

  const slug = (formData.get('slug') as string).trim() || toSlug(name)
  const supabase = await createClient()

  const { error } = await supabase.from('categories').insert({ name, slug })
  if (error) return { error: error.message }

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function updateCategory(id: string, formData: FormData) {
  const name = (formData.get('name') as string).trim()
  const slug = (formData.get('slug') as string).trim()
  if (!name || !slug) return { error: 'Nom et slug obligatoires' }

  const supabase = await createClient()
  const { error } = await supabase.from('categories').update({ name, slug }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()

  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)

  if (count && count > 0) {
    return { error: `Impossible : ${count} produit(s) utilisent cette catégorie` }
  }

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/categories')
  return { success: true }
}
