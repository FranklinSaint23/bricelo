'use client'

import { useState } from 'react'
import { Search, UserPlus, Pencil, ShieldAlert, Key, UserCheck, Check, AlertCircle, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'
import { updateUserAction, createUserAction } from '@/app/(admin)/admin/utilisateurs/actions'

interface UserItem {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  role: 'customer' | 'vendor' | 'support' | 'admin'
  avatar_url?: string | null
  created_at: string
}

interface Props {
  initialUsers: UserItem[]
  currentAdminId: string
}

const roleBadge: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  admin: 'danger',
  vendor: 'warning',
  customer: 'default',
  support: 'success',
}

export function UserAdminTable({ initialUsers, currentAdminId }: Props) {
  const [users, setUsers]           = useState<UserItem[]>(initialUsers)
  const [search, setSearch]         = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  // Modals state
  const [editUser, setEditUser]     = useState<UserItem | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  // Edit form state
  const [editName, setEditName]     = useState('')
  const [editEmail, setEditEmail]   = useState('')
  const [editPhone, setEditPhone]   = useState('')
  const [editRole, setEditRole]     = useState<'customer' | 'vendor' | 'support' | 'admin'>('customer')
  const [newPassword, setNewPassword] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError]   = useState<string | null>(null)
  const [editSuccess, setEditSuccess] = useState(false)

  // Create form state
  const [createName, setCreateName]     = useState('')
  const [createEmail, setCreateEmail]   = useState('')
  const [createPhone, setCreatePhone]   = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createRole, setCreateRole]     = useState<'customer' | 'vendor' | 'support'>('customer')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError]   = useState<string | null>(null)

  function openEditModal(u: UserItem) {
    setEditUser(u)
    setEditName(u.full_name || '')
    setEditEmail(u.email || '')
    setEditPhone(u.phone || '')
    setEditRole(u.role)
    setNewPassword('')
    setEditError(null)
    setEditSuccess(false)
  }

  async function handleUpdateSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editUser) return
    setEditError(null)
    setEditSuccess(false)
    setEditLoading(true)

    const res = await updateUserAction({
      userId: editUser.id,
      full_name: editName.trim(),
      email: editEmail.trim() || null,
      phone: editPhone.trim() || null,
      role: editRole,
      newPassword: newPassword.trim() || undefined,
    })

    setEditLoading(false)

    if (res?.error) {
      setEditError(res.error)
    } else {
      setEditSuccess(true)
      // Mettre à jour l'état local
      setUsers(prev => prev.map(u => u.id === editUser.id ? {
        ...u,
        full_name: editName.trim(),
        email: editEmail.trim() || null,
        phone: editPhone.trim() || null,
        role: editRole,
      } : u))
      setTimeout(() => {
        setEditUser(null)
      }, 1200)
    }
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCreateError(null)
    setCreateLoading(true)

    const res = await createUserAction({
      full_name: createName.trim(),
      email: createEmail.trim() || undefined,
      phone: createPhone.trim() || undefined,
      password: createPassword,
      role: createRole,
    })

    setCreateLoading(false)

    if (res?.error) {
      setCreateError(res.error)
    } else {
      setShowCreate(false)
      setCreateName('')
      setCreateEmail('')
      setCreatePhone('')
      setCreatePassword('')
      // Recharger ou rafraîchir la page
      window.location.reload()
    }
  }

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      (u.full_name?.toLowerCase().includes(q)) ||
      (u.email?.toLowerCase().includes(q)) ||
      (u.phone?.toLowerCase().includes(q))

    const matchesRole = roleFilter === 'all' || u.role === roleFilter

    return matchesSearch && matchesRole
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Barre de Filtres et Action Ajouter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[var(--color-slate-200)] shadow-2xs">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-slate-400)]" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--color-slate-200)] focus:outline-none focus:border-[var(--color-navy-900)]"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-[var(--color-slate-200)] bg-white text-[var(--color-navy-900)] focus:outline-none"
          >
            <option value="all">Tous les rôles ({users.length})</option>
            <option value="customer">Clients uniquement</option>
            <option value="vendor">Vendeurs uniquement</option>
            <option value="admin">Administrateurs</option>
          </select>
        </div>

        <Button onClick={() => setShowCreate(true)} className="gap-2 shrink-0">
          <UserPlus className="h-4 w-4" /> Créer un utilisateur
        </Button>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-xl border border-[var(--color-slate-200)] overflow-hidden shadow-2xs">
        {filteredUsers.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <Search className="h-8 w-8 text-[var(--color-slate-300)]" />
            <p className="text-sm font-semibold text-[var(--color-navy-900)]">Aucun utilisateur trouvé.</p>
            <p className="text-xs text-[var(--color-slate-500)]">Essayez de modifier votre recherche ou le filtre de rôle.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--color-slate-50)] border-b border-[var(--color-slate-200)]">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-semibold text-[var(--color-slate-500)] uppercase tracking-wider">Utilisateur</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-[var(--color-slate-500)] uppercase tracking-wider">Contact</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-[var(--color-slate-500)] uppercase tracking-wider">Rôle</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-[var(--color-slate-500)] uppercase tracking-wider">Date d'inscription</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-[var(--color-slate-500)] uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-slate-100)]">
                {filteredUsers.map((u) => {
                  const isAdmin = u.role === 'admin'
                  return (
                    <tr key={u.id} className="hover:bg-[var(--color-slate-50)] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar src={u.avatar_url} name={u.full_name || 'Utilisateur'} size="sm" />
                          <div>
                            <p className="font-semibold text-[var(--color-navy-900)]">{u.full_name || 'Sans nom'}</p>
                            <p className="text-xs text-[var(--color-slate-400)] font-mono">ID: {u.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-medium text-[var(--color-navy-900)]">{u.email || '—'}</p>
                        <p className="text-xs text-[var(--color-slate-500)]">{u.phone || '—'}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={roleBadge[u.role] ?? 'default'} size="sm">
                          {u.role === 'admin' ? 'Admin' : u.role === 'vendor' ? 'Vendeur' : 'Client'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[var(--color-slate-500)]">{formatDate(u.created_at)}</td>
                      <td className="px-5 py-3.5 text-right">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                            <ShieldAlert className="h-3.5 w-3.5 shrink-0" /> Admin protégé
                          </span>
                        ) : (
                          <Button
                            onClick={() => openEditModal(u)}
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                          >
                            <Pencil className="h-3.5 w-3.5 text-[var(--color-accent)]" /> Modifier & Pwd
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE MODIFICATION ET RÉINITIALISATION MOT DE PASSE */}
      {editUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[var(--color-slate-200)] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setEditUser(null)}
              className="absolute right-4 top-4 text-[var(--color-slate-400)] hover:text-[var(--color-navy-900)] p-1 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 border-b border-[var(--color-slate-100)] pb-4">
              <Avatar src={editUser.avatar_url} name={editName} size="md" />
              <div>
                <h2 className="text-lg font-bold text-[var(--color-navy-900)]">Modifier l'Utilisateur</h2>
                <p className="text-xs text-[var(--color-slate-500)]">{editUser.email || editUser.phone}</p>
              </div>
            </div>

            {editSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-green-800 flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 shrink-0" />
                <span>Utilisateur et mot de passe mis à jour avec succès !</span>
              </div>
            )}

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateSubmit} className="flex flex-col gap-4">
              <Input
                label="Nom et Prénom"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Adresse E-mail"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="exemple@bricelo.cm"
                />
                <Input
                  label="Téléphone"
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+237 6XX XXX XXX"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-navy-900)] mb-1.5">Rôle du Compte</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-slate-300)] bg-white font-medium text-[var(--color-navy-900)]"
                >
                  <option value="customer">Client (Acheteur)</option>
                  <option value="vendor">Vendeur (Boutique)</option>
                  <option value="support">Support / Équipe</option>
                </select>
              </div>

              {/* NOUVEAU MOT DE PASSE */}
              <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-xl flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Key className="h-4 w-4 text-amber-600" />
                  <span>Réinitialiser le Mot de passe de cet utilisateur</span>
                </div>
                <p className="text-[11px] text-amber-800/80 leading-relaxed">
                  Saisissez le nouveau mot de passe ci-dessous pour forcer la mise à jour immédiate du compte. Laissez vide pour ne pas modifier.
                </p>
                <Input
                  type="text"
                  placeholder="Saisir le nouveau mot de passe (min 8 car.)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white border-amber-300 focus:border-amber-600 font-mono text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-[var(--color-slate-100)]">
                <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
                  Annuler
                </Button>
                <Button type="submit" loading={editLoading}>
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CRÉATION UTILISATEUR */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[var(--color-slate-200)] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowCreate(false)}
              className="absolute right-4 top-4 text-[var(--color-slate-400)] hover:text-[var(--color-navy-900)] p-1 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-bold text-[var(--color-navy-900)] mb-1">Créer un Nouvel Utilisateur</h2>
            <p className="text-xs text-[var(--color-slate-500)] mb-4">Créez un compte client ou vendeur directement depuis l'Administration.</p>

            {createError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              <Input
                label="Nom et Prénom *"
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Jean Dupont"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="E-mail"
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="jean@exemple.cm"
                />
                <Input
                  label="Téléphone"
                  type="tel"
                  value={createPhone}
                  onChange={(e) => setCreatePhone(e.target.value)}
                  placeholder="+237 6XX XXX XXX"
                />
              </div>

              <Input
                label="Mot de passe de départ *"
                type="text"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="MotDePasse123!"
                required
                helper="Au moins 8 caractères"
              />

              <div>
                <label className="block text-xs font-semibold text-[var(--color-navy-900)] mb-1.5">Rôle attribué</label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-slate-300)] bg-white font-medium text-[var(--color-navy-900)]"
                >
                  <option value="customer">Client (Acheteur)</option>
                  <option value="vendor">Vendeur (Boutique)</option>
                  <option value="support">Support</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-[var(--color-slate-100)]">
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Annuler
                </Button>
                <Button type="submit" loading={createLoading}>
                  Créer le compte
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
