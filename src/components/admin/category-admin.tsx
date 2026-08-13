'use client'

import { useState, useTransition, Fragment } from 'react'
import { Plus, Pencil, Trash2, X, Check, AlertCircle, Tag, Package } from 'lucide-react'
import { CategoryIcon } from '@/components/ui/category-icon'
import { createCategory, updateCategory, deleteCategory } from '@/app/(admin)/admin/categories/actions'

interface Category {
  id: string
  name: string
  slug: string
  created_at: string
}

interface Props {
  categories: Category[]
  countMap: Record<string, number>
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function CategoryAdmin({ categories, countMap }: Props) {
  const [showAdd, setShowAdd]     = useState(false)
  const [editId, setEditId]       = useState<string | null>(null)
  const [deleteId, setDeleteId]   = useState<string | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const [success, setSuccess]     = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Add form state
  const [addName, setAddName] = useState('')
  const [addSlug, setAddSlug] = useState('')

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')

  function flash(msg: string, type: 'ok' | 'err') {
    if (type === 'ok') { setSuccess(msg); setError(null) }
    else { setError(msg); setSuccess(null) }
    setTimeout(() => { setSuccess(null); setError(null) }, 3500)
  }

  function startEdit(cat: Category) {
    setEditId(cat.id)
    setEditName(cat.name)
    setEditSlug(cat.slug)
    setShowAdd(false)
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('name', addName)
    fd.set('slug', addSlug)
    startTransition(async () => {
      const res = await createCategory(fd)
      if ('error' in res) { flash(res.error ?? 'Erreur', 'err') }
      else { flash('Catégorie créée.', 'ok'); setShowAdd(false); setAddName(''); setAddSlug('') }
    })
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editId) return
    const fd = new FormData()
    fd.set('name', editName)
    fd.set('slug', editSlug)
    startTransition(async () => {
      const res = await updateCategory(editId, fd)
      if ('error' in res) { flash(res.error ?? 'Erreur', 'err') }
      else { flash('Catégorie mise à jour.', 'ok'); setEditId(null) }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deleteCategory(id)
      if ('error' in res) { flash(res.error ?? 'Erreur', 'err') }
      else { flash('Catégorie supprimée.', 'ok') }
      setDeleteId(null)
    })
  }

  return (
    <div className="p-6 lg:p-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-navy-900)]">Catégories</h1>
          <p className="text-sm text-[var(--color-slate-500)] mt-0.5">{categories.length} catégorie{categories.length !== 1 ? 's' : ''} au total</p>
        </div>
        <button
          onClick={() => { setShowAdd(v => !v); setEditId(null) }}
          className="flex items-center gap-2 h-10 px-4 bg-[var(--color-accent)] hover:bg-amber-400 text-[var(--color-navy-900)] font-semibold text-sm rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ajouter une catégorie
        </button>
      </div>

      {/* Flash messages */}
      {error && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          <Check className="h-4 w-4 shrink-0" /> {success}
        </div>
      )}

      {/* Formulaire d'ajout */}
      {showAdd && (
        <form onSubmit={handleAdd} className="mb-6 bg-white rounded-xl border border-[var(--color-slate-200)] p-5">
          <h2 className="font-semibold text-[var(--color-navy-900)] mb-4 flex items-center gap-2">
            <Tag className="h-4 w-4 text-[var(--color-accent)]" /> Nouvelle catégorie
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate-500)] mb-1">Nom *</label>
              <input
                value={addName}
                onChange={e => { setAddName(e.target.value); if (!addSlug || addSlug === toSlug(addName)) setAddSlug(toSlug(e.target.value)) }}
                placeholder="Ex: Téléphones & Tablettes"
                required
                className="w-full h-10 px-3 text-sm border border-[var(--color-slate-300)] rounded-lg focus:outline-none focus:border-[var(--color-navy-900)] text-[var(--color-navy-900)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-slate-500)] mb-1">Slug (auto-généré)</label>
              <input
                value={addSlug}
                onChange={e => setAddSlug(e.target.value)}
                placeholder="telephones-tablettes"
                className="w-full h-10 px-3 text-sm border border-[var(--color-slate-300)] rounded-lg focus:outline-none focus:border-[var(--color-navy-900)] font-mono text-[var(--color-slate-600)]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setShowAdd(false)}
              className="h-9 px-4 text-sm rounded-lg border border-[var(--color-slate-300)] text-[var(--color-slate-600)] hover:bg-[var(--color-slate-50)] transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={isPending}
              className="h-9 px-5 text-sm font-semibold rounded-lg bg-[var(--color-navy-900)] text-white hover:bg-[var(--color-navy-950)] disabled:opacity-50 transition-colors">
              {isPending ? 'Enregistrement…' : 'Créer'}
            </button>
          </div>
        </form>
      )}

      {/* Liste */}
      <div className="bg-white rounded-xl border border-[var(--color-slate-200)] overflow-hidden">
        {categories.length === 0 ? (
          <div className="py-16 text-center">
            <Tag className="h-10 w-10 text-[var(--color-slate-200)] mx-auto mb-3" />
            <p className="text-sm text-[var(--color-slate-400)]">Aucune catégorie. Créez-en une ci-dessus.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-slate-50)] border-b border-[var(--color-slate-200)]">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-slate-400)] uppercase tracking-wide">Catégorie</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-slate-400)] uppercase tracking-wide hidden sm:table-cell">Slug</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-[var(--color-slate-400)] uppercase tracking-wide">Produits</th>
                <th className="px-5 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-slate-100)]">
              {categories.map(cat => (
                <Fragment key={cat.id}>
                  <tr className="hover:bg-[var(--color-slate-50)] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <CategoryIcon slug={cat.slug} size="sm" />
                        <span className="font-semibold text-[var(--color-navy-900)]">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <code className="text-xs bg-[var(--color-slate-100)] px-2 py-1 rounded text-[var(--color-slate-600)]">{cat.slug}</code>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-[var(--color-slate-600)]">
                        <Package className="h-3.5 w-3.5" />
                        {countMap[cat.id] ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(cat)}
                          className="p-1.5 rounded-md text-[var(--color-slate-400)] hover:text-[var(--color-navy-900)] hover:bg-[var(--color-slate-100)] transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteId(cat.id)}
                          className="p-1.5 rounded-md text-[var(--color-slate-400)] hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Ligne d'édition inline */}
                  {editId === cat.id && (
                    <tr className="bg-amber-50 border-l-2 border-[var(--color-accent)]">
                      <td colSpan={4} className="px-5 py-4">
                        <form onSubmit={handleEdit}>
                          <div className="grid sm:grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="block text-xs font-semibold text-[var(--color-slate-500)] mb-1">Nom</label>
                              <input value={editName} onChange={e => setEditName(e.target.value)} required
                                className="w-full h-9 px-3 text-sm border border-[var(--color-slate-300)] rounded-lg focus:outline-none focus:border-[var(--color-navy-900)]" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-[var(--color-slate-500)] mb-1">Slug</label>
                              <input value={editSlug} onChange={e => setEditSlug(e.target.value)} required
                                className="w-full h-9 px-3 text-sm border border-[var(--color-slate-300)] rounded-lg focus:outline-none focus:border-[var(--color-navy-900)] font-mono" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button type="submit" disabled={isPending}
                              className="h-8 px-4 text-xs font-semibold rounded-lg bg-[var(--color-navy-900)] text-white hover:bg-[var(--color-navy-950)] disabled:opacity-50 transition-colors">
                              {isPending ? 'Enregistrement…' : 'Enregistrer'}
                            </button>
                            <button type="button" onClick={() => setEditId(null)}
                              className="h-8 px-3 text-xs rounded-lg border border-[var(--color-slate-300)] text-[var(--color-slate-600)] hover:bg-white transition-colors">
                              Annuler
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  )}

                  {/* Confirmation suppression */}
                  {deleteId === cat.id && (
                    <tr className="bg-red-50 border-l-2 border-red-400">
                      <td colSpan={4} className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                          <span className="text-sm text-red-700 flex-1">
                            Supprimer <strong>{cat.name}</strong> ? Cette action est irréversible.
                          </span>
                          <button onClick={() => handleDelete(cat.id)} disabled={isPending}
                            className="h-8 px-4 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
                            Supprimer
                          </button>
                          <button onClick={() => setDeleteId(null)}
                            className="h-8 px-3 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-100 transition-colors">
                            Annuler
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
