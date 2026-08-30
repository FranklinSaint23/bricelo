'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateUserAction(formData: {
  userId: string
  full_name: string
  email?: string | null
  phone?: string | null
  role: 'customer' | 'vendor' | 'support' | 'admin'
  newPassword?: string
}) {
  try {
    const adminClient = getAdminClient()

    // 1. Vérifier si l'utilisateur cible est un Administrateur
    const { data: targetUser } = await adminClient
      .from('users')
      .select('id, role, email, phone')
      .eq('id', formData.userId)
      .single()

    if (!targetUser) {
      return { error: 'Utilisateur introuvable.' }
    }

    if (targetUser.role === 'admin') {
      return { error: 'SÉCURITÉ : Les comptes Administrateur ne peuvent pas être réinitialisés ou modifiés ici.' }
    }

    // Interdire d'attribuer le rôle admin via ce formulaire
    const assignedRole = formData.role === 'admin' ? 'customer' : formData.role

    // 2. Mettre à jour la table public.users
    const { error: dbErr } = await adminClient
      .from('users')
      .update({
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone || null,
        role: assignedRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', formData.userId)

    if (dbErr) {
      console.error('[updateUserAction] DB Error:', dbErr)
      return { error: dbErr.message }
    }

    // 3. Si un nouveau mot de passe est saisi, le mettre à jour dans Supabase Auth
    if (formData.newPassword && formData.newPassword.trim().length > 0) {
      if (formData.newPassword.trim().length < 8) {
        return { error: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' }
      }

      const updatePayload: any = {
        password: formData.newPassword.trim(),
        user_metadata: { full_name: formData.full_name },
      }
      if (formData.email) updatePayload.email = formData.email
      if (formData.phone) updatePayload.phone = formData.phone

      const { error: authErr } = await adminClient.auth.admin.updateUserById(
        formData.userId,
        updatePayload
      )

      if (authErr) {
        console.error('[updateUserAction] Auth Error:', authErr)
        return { error: `Erreur d'authentification : ${authErr.message}` }
      }

      // Marquer la demande de réinitialisation comme complétée dans password_resets
      await adminClient
        .from('password_resets')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .or(`user_id.eq.${formData.userId},identifier.eq.${targetUser.email || 'none'},identifier.eq.${targetUser.phone || 'none'}`)
        .eq('status', 'pending')
    }

    revalidatePath('/admin/utilisateurs')
    return { success: true }
  } catch (err: any) {
    console.error('[updateUserAction] Exception:', err)
    return { error: err.message || 'Erreur lors de la mise à jour.' }
  }
}

export async function createUserAction(formData: {
  full_name: string
  email?: string
  phone?: string
  password?: string
  role: 'customer' | 'vendor' | 'support'
}) {
  try {
    const adminClient = getAdminClient()
    const rawPhone = (formData.phone || '').replace(/\D/g, '')
    const targetEmail = formData.email?.trim()
      ? formData.email.trim()
      : `${rawPhone || Date.now()}@bricelo.phone`

    if (!formData.password || formData.password.length < 8) {
      return { error: 'Le mot de passe doit contenir au moins 8 caractères.' }
    }

    // 1. Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authErr } = await adminClient.auth.admin.createUser({
      email: targetEmail,
      phone: formData.phone?.trim() || undefined,
      password: formData.password,
      email_confirm: true,
      user_metadata: {
        full_name: formData.full_name,
        phone: formData.phone,
      },
    })

    if (authErr || !authData.user) {
      console.error('[createUserAction] Auth Error:', authErr)
      return { error: authErr?.message || 'Erreur création authentification' }
    }

    // 2. Insérer dans public.users
    const { error: dbErr } = await adminClient.from('users').upsert({
      id: authData.user.id,
      full_name: formData.full_name,
      email: formData.email || null,
      phone: formData.phone || null,
      role: formData.role || 'customer',
    })

    if (dbErr) {
      console.error('[createUserAction] DB Error:', dbErr)
      return { error: dbErr.message }
    }

    revalidatePath('/admin/utilisateurs')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteUserAction(userId: string) {
  try {
    const adminClient = getAdminClient()

    // 1. Vérifier la cible
    const { data: targetUser } = await adminClient
      .from('users')
      .select('id, role, full_name')
      .eq('id', userId)
      .single()

    if (!targetUser) {
      return { error: 'Utilisateur introuvable.' }
    }

    if (targetUser.role === 'admin') {
      return { error: 'SÉCURITÉ : Impossible de supprimer un compte Administrateur.' }
    }

    // Détacher les commandes passées par cet utilisateur pour préserver l'historique d'achats
    await adminClient.from('orders').update({ user_id: null }).eq('user_id', userId)

    // 2. Si c'est un vendeur, nettoyer ses produits et sa boutique
    const { data: store } = await adminClient
      .from('stores')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (store) {
      // Détacher les commandes de la boutique pour préserver l'historique d'achats sans violer la clé étrangère orders_store_id_fkey
      await adminClient.from('orders').update({ store_id: null }).eq('store_id', store.id)
      await adminClient.from('products').delete().eq('store_id', store.id)

      const { error: storeDelErr } = await adminClient.from('stores').delete().eq('id', store.id)
      if (storeDelErr) {
        console.warn('[deleteUserAction] Suppression boutique bloquée, désactivation de sécurité:', storeDelErr.message)
        await adminClient.from('stores').update({ is_active: false }).eq('id', store.id)
      }
    }

    // 3. Supprimer de la table public.users
    const { error: dbErr } = await adminClient.from('users').delete().eq('id', userId)
    if (dbErr) {
      console.error('[deleteUserAction] DB Error:', dbErr)
      return { error: dbErr.message }
    }

    // 4. Supprimer dans Supabase Auth (admin)
    const { error: authErr } = await adminClient.auth.admin.deleteUser(userId)
    if (authErr) {
      console.warn('[deleteUserAction] Auth Delete Warning:', authErr)
    }

    revalidatePath('/admin/utilisateurs')
    return { success: true }
  } catch (err: any) {
    console.error('[deleteUserAction] Exception:', err)
    return { error: err.message || 'Erreur lors de la suppression de l\'utilisateur.' }
  }
}

export async function requestForgotPasswordAdminNotif(data: {
  identifier: string
  desiredPassword: string
  fullName?: string
}) {
  try {
    const adminClient = getAdminClient()
    const dateStr = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' })
    const adminEmail = 'bricelo237@gmail.com'

    // Tenter de retrouver l'utilisateur dans la base de données
    const { data: foundUser } = await adminClient
      .from('users')
      .select('id, full_name, email, phone, role')
      .or(`email.eq.${data.identifier},phone.eq.${data.identifier}`)
      .maybeSingle()

    const userName = foundUser?.full_name || data.fullName || 'Client'
    const userRole = foundUser?.role || 'customer'
    const searchUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bricelo.cm'}/admin/utilisateurs`

    // Insérer la demande dans la table password_resets pour le suivi en direct
    const { data: resetRow, error: resetErr } = await adminClient
      .from('password_resets')
      .insert({
        user_id: foundUser?.id || null,
        identifier: data.identifier.trim(),
        desired_password: data.desiredPassword.trim(),
        status: 'pending',
      })
      .select('id')
      .single()

    if (resetErr) console.warn('[requestForgotPasswordAdminNotif] Insert password_resets warning:', resetErr)

    // Insérer dans les notifications DB Admin
    await adminClient.from('notifications').insert({
      title: `🔑 Demande réinitialisation mot de passe: ${userName}`,
      content: `Identifiant: ${data.identifier} - Nouveau mot de passe souhaité: "${data.desiredPassword}"`,
      is_read: false,
      metadata: { identifier: data.identifier, desiredPassword: data.desiredPassword, userName, resetId: resetRow?.id },
    })

    // Envoyer un e-mail immédiat à l'Admin (bricelo237@gmail.com) via Resend
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'placeholder') {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'BRICELO Marketplace <onboarding@resend.dev>',
          to: [adminEmail],
          subject: `🔑 [ACTION ADMIN REQUIS] Demande de mot de passe pour ${userName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 12px;">
              <div style="background-color: #0f172a; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 24px;">
                <h1 style="color: #f59e0b; margin: 0; font-size: 20px;">🔑 DEMANDE DE RÉINITIALISATION DE MOT DE PASSE</h1>
                <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">Demandé le ${dateStr}</p>
              </div>

              <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
                <h3 style="color: #0f172a; margin-top: 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">👤 Informations du Demandeur</h3>
                <p><strong>Nom / Prénom :</strong> ${userName}</p>
                <p><strong>Identifiant (E-mail / Téléphone) :</strong> <span style="font-family: monospace; background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${data.identifier}</span></p>
                <p><strong>Rôle du compte :</strong> ${userRole}</p>
              </div>

              <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <h3 style="color: #0f172a; margin-top: 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">🔒 Nouveau Mot de Passe Souhaité</h3>
                <p style="font-size: 16px; font-weight: bold; color: #059669; background-color: #ecfdf5; padding: 12px; border-radius: 8px; border: 1px solid #a7f3d0; margin: 8px 0; font-family: monospace;">
                  ${data.desiredPassword}
                </p>
                <p style="font-size: 12px; color: #64748b; margin: 0;">
                  Vous pouvez copier ce mot de passe et l'appliquer directement au compte dans votre tableau de bord Admin.
                </p>
              </div>

              <div style="text-align: center; margin: 24px 0;">
                <a href="${searchUrl}" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                  🔑 Ouvrir la gestion des utilisateurs dans l'Admin
                </a>
              </div>
            </div>
          `,
        }),
      })
    }

    return { success: true, resetId: resetRow?.id }
  } catch (err: any) {
    console.error('[requestForgotPasswordAdminNotif] Erreur:', err)
    return { error: err.message || 'Erreur lors de la transmission.' }
  }
}

export async function checkPasswordResetStatusAction(identifier: string, resetId?: string) {
  try {
    const adminClient = getAdminClient()
    let query = adminClient
      .from('password_resets')
      .select('status')
      .order('created_at', { ascending: false })

    if (resetId) {
      query = query.eq('id', resetId)
    } else {
      query = query.eq('identifier', identifier.trim())
    }

    const { data } = await query.limit(1).maybeSingle()
    return { status: data?.status || 'pending' }
  } catch (err) {
    return { status: 'pending' }
  }
}
