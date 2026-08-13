'use client'

import { useState } from 'react'
import { CheckCircle2, User, Building2, FileText, ChevronRight, ChevronLeft } from 'lucide-react'
import { submitVendorApplication } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardBody } from '@/components/ui/card'

const STEPS = ['Informations personnelles', 'Votre entreprise', 'Documents']

const BUSINESS_TYPES = [
  'Commerce général',
  'Mode & Vêtements',
  'Électronique & Informatique',
  'Électroménager',
  'Alimentation & Épicerie',
  'Beauté & Santé',
  'Maison & Bureau',
  'Jouets & Jeux',
  'Auto & Moto',
  'Sport & Loisirs',
  'Autre',
]

const DOCS = [
  { key: 'has_cni',                  label: 'Photocopie CNI' },
  { key: 'has_registre_commerce',    label: 'Registre de commerce' },
  { key: 'has_carte_contribuable',   label: 'Carte de contribuable' },
  { key: 'has_plan_localisation',    label: 'Plan de localisation' },
  { key: 'has_patente',              label: 'Patente' },
  { key: 'has_licence_exploitation', label: "Licence d'exploitation (produits de marque)" },
]

export function VendorApplicationForm() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  // Step 1 — personal
  const [fullName,   setFullName]   = useState('')
  const [email,      setEmail]      = useState('')
  const [phone,      setPhone]      = useState('')
  const [gender,     setGender]     = useState('homme')
  const [birthDate,  setBirthDate]  = useState('')

  // Step 2 — business
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [city,         setCity]         = useState('')
  const [address,      setAddress]      = useState('')

  // Step 3 — documents
  const [docs, setDocs] = useState<Record<string, boolean>>({
    has_cni: false,
    has_registre_commerce: false,
    has_carte_contribuable: false,
    has_plan_localisation: false,
    has_patente: false,
    has_licence_exploitation: false,
  })

  function toggleDoc(key: string) {
    setDocs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function validateStep() {
    if (step === 0) {
      if (!fullName.trim()) { setError('Le nom complet est requis.'); return false }
      if (!email.trim() || !email.includes('@')) { setError('E-mail invalide.'); return false }
      if (!phone.trim()) { setError('Le numéro de téléphone est requis.'); return false }
    }
    if (step === 1) {
      if (!businessName.trim()) { setError("Le nom de l'entreprise est requis."); return false }
      if (!city.trim()) { setError('La ville est requise.'); return false }
    }
    setError(null)
    return true
  }

  function next() {
    if (!validateStep()) return
    setStep((s) => s + 1)
  }

  async function handleSubmit() {
    setError(null)
    setLoading(true)
    const result = await submitVendorApplication({
      full_name:    fullName.trim(),
      email:        email.trim(),
      phone:        phone.trim(),
      gender,
      birth_date:   birthDate,
      business_name: businessName.trim(),
      business_type: businessType,
      city:         city.trim(),
      address:      address.trim(),
      ...docs as any,
    })
    setLoading(false)
    if (result?.error) {
      setError(result.error)
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="text-center py-16">
        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-navy-900)] mb-2">Candidature envoyée !</h2>
        <p className="text-[var(--color-slate-500)] text-sm max-w-sm mx-auto">
          Merci <strong>{fullName}</strong> ! Notre équipe examinera votre dossier et vous contactera à <strong>{email}</strong> sous 48h.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => {
          const icons = [User, Building2, FileText]
          const Icon = icons[i]
          return (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className="flex flex-col items-center gap-1">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-colors
                  ${i < step  ? 'bg-[var(--color-navy-900)] border-[var(--color-navy-900)] text-white'
                  : i === step ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-navy-900)]'
                               : 'border-[var(--color-slate-200)] bg-white text-[var(--color-slate-400)]'}`}
                >
                  {i < step ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`text-[10px] font-semibold hidden sm:block text-center leading-tight max-w-[80px]
                  ${i === step ? 'text-[var(--color-navy-900)]' : 'text-[var(--color-slate-400)]'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mb-4 sm:mb-5 transition-colors
                  ${i < step ? 'bg-[var(--color-navy-900)]' : 'bg-[var(--color-slate-200)]'}`} />
              )}
            </div>
          )
        })}
      </div>

      <Card>
        <CardBody className="p-6 flex flex-col gap-5">

          {/* ── STEP 0: Infos personnelles ── */}
          {step === 0 && (
            <>
              <h2 className="font-bold text-[var(--color-navy-900)]">Informations personnelles</h2>
              <Input
                label="Nom & Prénom *"
                placeholder="Ex : Jean-Pierre Nkomo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="Adresse e-mail *"
                type="email"
                placeholder="vous@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Numéro de téléphone *"
                type="tel"
                placeholder="+237 6XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-navy-900)]">Sexe</label>
                <div className="flex gap-4">
                  {['homme', 'femme'].map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={gender === g}
                        onChange={() => setGender(g)}
                        className="accent-[var(--color-accent)]"
                      />
                      <span className="text-sm capitalize text-[var(--color-slate-700)]">{g}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-navy-900)]">Date de naissance</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="h-10 px-3 text-sm border border-[var(--color-slate-200)] rounded-[var(--radius-md)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent text-[var(--color-navy-900)]"
                />
              </div>
            </>
          )}

          {/* ── STEP 1: Entreprise ── */}
          {step === 1 && (
            <>
              <h2 className="font-bold text-[var(--color-navy-900)]">Votre entreprise</h2>
              <Input
                label="Nom de l'entreprise / boutique *"
                placeholder="Ex : Boutique Élégance Douala"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-navy-900)]">Type d&apos;activité</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="h-10 px-3 text-sm border border-[var(--color-slate-200)] rounded-[var(--radius-md)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-[var(--color-navy-900)]"
                >
                  <option value="">— Choisir un secteur —</option>
                  {BUSINESS_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Ville *"
                placeholder="Ex : Douala, Yaoundé…"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-navy-900)]">Adresse de la boutique</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Quartier, rue, numéro…"
                  rows={3}
                  className="px-3 py-2.5 text-sm border border-[var(--color-slate-200)] rounded-[var(--radius-md)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent resize-none text-[var(--color-navy-900)]"
                />
              </div>
            </>
          )}

          {/* ── STEP 2: Documents ── */}
          {step === 2 && (
            <>
              <h2 className="font-bold text-[var(--color-navy-900)]">Documents disponibles</h2>
              <p className="text-sm text-[var(--color-slate-500)] -mt-2">
                Cochez les documents que vous possédez et que vous pourrez fournir lors de la validation.
              </p>
              <div className="flex flex-col gap-3">
                {DOCS.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                      ${docs[key]
                        ? 'bg-[var(--color-navy-900)] border-[var(--color-navy-900)]'
                        : 'border-[var(--color-slate-300)] group-hover:border-[var(--color-slate-400)]'}`}
                      onClick={() => toggleDoc(key)}
                    >
                      {docs[key] && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <span className="text-sm text-[var(--color-slate-700)]" onClick={() => toggleDoc(key)}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                Ces documents seront demandés lors de la validation de votre candidature. Vous n&apos;avez pas besoin de les télécharger maintenant.
              </div>
            </>
          )}

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-2">
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
              </Button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={next}>
                Suivant <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} loading={loading}>
                Envoyer ma candidature
              </Button>
            )}
          </div>

        </CardBody>
      </Card>
    </div>
  )
}
