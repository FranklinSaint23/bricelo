'use client'

import { useState, useEffect } from 'react'
import {
  GraduationCap, Plus, Pencil, Trash2, Eye, EyeOff, Video,
  PlayCircle, CheckCircle2, Sparkles, AlertCircle, X, Save, Upload
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import {
  getAdminTutorials, saveTutorial, toggleTutorialStatus,
  deleteTutorial, TutorialItem
} from './actions'

const CATEGORY_LABELS: Record<string, string> = {
  seller: '🚀 S’inscrire & Boutique',
  product: '📦 Produits & Stocks',
  payment: '💳 Paiements & Retraits',
  buyer: '🛒 Guide Acheteur',
  growth: '🔥 Astuces de Ventes',
}

export default function AdminTutorialsPage() {
  const [tutorials, setTutorials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TutorialItem | null>(null)
  const [saving, setSaving] = useState(false)

  // Form Fields
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<'seller' | 'product' | 'payment' | 'buyer' | 'growth'>('seller')
  const [duration, setDuration] = useState('3 min')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [description, setDescription] = useState('')
  const [steps, setSteps] = useState<string[]>([''])
  const [uploadingImg, setUploadingImg] = useState(false)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImg(true)
    const supabase = createClient()
    try {
      const ext = file.name.split('.').pop()
      const path = `tuto-${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
      let bucketName = 'product-images'

      let { error: uploadErr } = await supabase.storage.from(bucketName).upload(path, file)
      if (uploadErr && uploadErr.message?.toLowerCase().includes('bucket not found')) {
        bucketName = 'products'
        const res = await supabase.storage.from(bucketName).upload(path, file)
        uploadErr = res.error
      }

      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(path)
      setThumbnailUrl(publicUrl)
    } catch (err: any) {
      alert(err.message || 'Erreur lors du téléversement de l’image')
    } finally {
      setUploadingImg(false)
    }
  }

  async function loadData() {
    setLoading(true)
    try {
      const list = await getAdminTutorials()
      setTutorials(list)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function openCreateModal() {
    setEditingItem(null)
    setTitle('')
    setCategory('seller')
    setDuration('3 min')
    setThumbnailUrl('')
    setVideoUrl('')
    setDescription('')
    setSteps(['S’inscrire sur BRICÉLO', 'Remplir le profil boutique'])
    setIsModalOpen(true)
  }

  function openEditModal(item: any) {
    setEditingItem(item)
    setTitle(item.title)
    setCategory(item.category)
    setDuration(item.duration || '3 min')
    setThumbnailUrl(item.thumbnail_url || '')
    setVideoUrl(item.video_url || '')
    setDescription(item.description)
    setSteps(Array.isArray(item.steps) && item.steps.length > 0 ? item.steps : [''])
    setIsModalOpen(true)
  }

  async function handleSave() {
    if (!title.trim() || !description.trim()) {
      alert('Veuillez remplir le titre et la description du tutoriel.')
      return
    }

    setSaving(true)
    try {
      await saveTutorial({
        id: editingItem?.id,
        title: title.trim(),
        category,
        duration,
        thumbnail_url: thumbnailUrl.trim(),
        video_url: videoUrl.trim(),
        description: description.trim(),
        steps: steps.filter((s) => s.trim().length > 0),
        is_published: editingItem?.is_published ?? true,
      })
      setIsModalOpen(false)
      await loadData()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(id: string, currentStatus: boolean) {
    try {
      await toggleTutorialStatus(id, !currentStatus)
      await loadData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Voulez-vous vraiment supprimer le tutoriel "${title}" ?`)) return
    try {
      await deleteTutorial(id)
      await loadData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl pb-24 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-extrabold text-[var(--color-navy-900)]">
              Gestion des Formations & Vidéos Académie
            </h1>
          </div>
          <p className="text-sm text-[var(--color-slate-500)] mt-1">
            Gérez les cours, vidéos et guides pratiques affichés sur la page *Apprendre à vendre en ligne*.
          </p>
        </div>

        <Button onClick={openCreateModal} size="md" className="bg-amber-400 text-slate-950 font-black hover:bg-amber-500">
          <Plus className="h-4 w-4" /> Ajouter une formation vidéo
        </Button>
      </div>

      {/* Cartes de Synthèse */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[var(--color-slate-200)] shadow-2xs">
          <p className="text-xs font-bold text-[var(--color-slate-500)] uppercase">Total Cours Vidéo</p>
          <p className="text-2xl font-black text-[var(--color-navy-900)] mt-1">{tutorials.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 shadow-2xs">
          <p className="text-xs font-bold text-emerald-700 uppercase">Publiés sur le site</p>
          <p className="text-2xl font-black text-emerald-900 mt-1">
            {tutorials.filter((t) => t.is_published).length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 shadow-2xs">
          <p className="text-xs font-bold text-amber-700 uppercase">En Brouillon / Masqués</p>
          <p className="text-2xl font-black text-amber-900 mt-1">
            {tutorials.filter((t) => !t.is_published).length}
          </p>
        </div>
      </div>

      {/* Liste des Tutoriels */}
      <Card className="border-[var(--color-slate-200)] shadow-xs overflow-hidden">
        <CardHeader className="bg-[var(--color-slate-100)] py-3.5 px-4 font-bold text-sm text-[var(--color-navy-900)] border-b border-[var(--color-slate-200)]">
          Liste des Tutoriels Disponibles ({tutorials.length})
        </CardHeader>
        <CardBody className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500 font-medium">Chargement des formations...</div>
          ) : tutorials.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Video className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="font-bold text-[var(--color-navy-900)]">Aucun tutoriel personnalisé pour l'instant</p>
              <p className="text-xs text-slate-500">Les tutoriels par défaut sont actuellement affichés sur la page publique.</p>
              <Button onClick={openCreateModal} size="sm" className="bg-amber-400 text-slate-950 font-bold">
                <Plus className="h-4 w-4" /> Créer le premier tutoriel
              </Button>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Vidéo / Miniature</th>
                  <th className="py-3 px-4">Titre & Catégorie</th>
                  <th className="py-3 px-4">Durée</th>
                  <th className="py-3 px-4">Étapes</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {tutorials.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="relative h-12 w-20 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                        {item.thumbnail_url && (
                          <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                        )}
                        <PlayCircle className="absolute inset-0 m-auto h-5 w-5 text-amber-400 fill-black/60" />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-[var(--color-navy-900)] text-xs line-clamp-1">{item.title}</p>
                      <span className="inline-block mt-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {CATEGORY_LABELS[item.category] || item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{item.duration}</td>
                    <td className="py-3 px-4 font-bold text-slate-600">
                      {Array.isArray(item.steps) ? item.steps.length : 0} étape(s)
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={item.is_published ? 'success' : 'warning'}>
                        {item.is_published ? 'Publié' : 'Brouillon'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(item)}
                          className="h-8 w-8 p-0"
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggle(item.id, item.is_published)}
                          className="h-8 w-8 p-0"
                          title={item.is_published ? 'Masquer' : 'Publier'}
                        >
                          {item.is_published ? <EyeOff className="h-4 w-4 text-amber-600" /> : <Eye className="h-4 w-4 text-emerald-600" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id, item.title)}
                          className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {/* Modal d'édition / Création */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-[var(--color-navy-950)] text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Video className="h-4 w-4 text-amber-400" />
                {editingItem ? 'Modifier le tutoriel' : 'Nouveau tutoriel vidéo'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre de la formation</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex: Comment s'inscrire en tant que Vendeur..."
                  className="h-9 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thématique</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full h-9 px-2 text-xs border border-slate-300 rounded-lg font-semibold bg-white"
                  >
                    <option value="seller">🚀 S’inscrire & Boutique</option>
                    <option value="product">📦 Produits & Stocks</option>
                    <option value="payment">💳 Paiements & Retraits</option>
                    <option value="buyer">🛒 Guide Acheteur</option>
                    <option value="growth">🔥 Astuces de Ventes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Durée estimée</label>
                  <Input
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="ex: 3 min"
                    className="h-9 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Image Miniature (Thumbnail)
                </label>
                <div className="flex items-center gap-3">
                  {thumbnailUrl && (
                    <div className="relative h-16 w-28 rounded-lg overflow-hidden border border-slate-300 bg-slate-900 shrink-0 group shadow-2xs">
                      <img src={thumbnailUrl} alt="Vignette" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setThumbnailUrl('')}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Retirer cette image"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}

                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-dashed border-slate-300 hover:border-amber-400 bg-slate-50 hover:bg-amber-500/5 text-xs font-bold text-slate-700 transition-all">
                      <Upload className="h-4 w-4 text-amber-500" />
                      <span>{uploadingImg ? 'Téléversement en cours...' : thumbnailUrl ? 'Changer la miniature' : 'Téléverser une image miniature'}</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImg}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 italic">Format recommandé: PNG, JPG ou WebP (max 5 Mo)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lien Vidéo (YouTube / MP4)</label>
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description concise</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Expliquez ce que le vendeur ou l'acheteur va apprendre dans cette vidéo..."
                  rows={3}
                  className="text-xs p-2.5"
                />
              </div>

              {/* Étapes écrites */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700">Étapes Pratiques (1, 2, 3...)</label>
                  <button
                    type="button"
                    onClick={() => setSteps([...steps, ''])}
                    className="text-[11px] text-amber-600 font-extrabold hover:underline"
                  >
                    + Ajouter une étape
                  </button>
                </div>
                <div className="space-y-2">
                  {steps.map((st, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <Input
                        value={st}
                        onChange={(e) => {
                          const updated = [...steps]
                          updated[idx] = e.target.value
                          setSteps(updated)
                        }}
                        placeholder={`Étape ${idx + 1}...`}
                        className="h-8 text-xs font-semibold flex-1"
                      />
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSteps(steps.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={saving} size="sm" className="bg-amber-400 text-slate-950 font-bold hover:bg-amber-500">
                <Save className="h-4 w-4" /> {saving ? 'Enregistrement...' : 'Enregistrer le tutoriel'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
