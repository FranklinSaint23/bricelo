'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle2, Lock, User, Eye, EyeOff } from 'lucide-react'
import { requestForgotPasswordAdminNotif } from '@/app/(admin)/admin/utilisateurs/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardBody } from '@/components/ui/card'
import { useLanguage } from '@/components/providers/language-provider'

export default function ForgotPasswordPage() {
  const { lang } = useLanguage()
  const [identifier, setIdentifier]       = useState('')
  const [desiredPassword, setDesiredPassword] = useState('')
  const [showPassword, setShowPassword]   = useState(false)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [sent, setSent]                   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const targetIdent = identifier.trim()
    const targetPwd   = desiredPassword.trim()

    if (!targetIdent) {
      setError(lang === 'fr' ? 'Veuillez saisir votre adresse e-mail ou votre numéro de téléphone.' : 'Please enter your email or phone number.')
      return
    }

    if (targetPwd.length < 8) {
      setError(lang === 'fr' ? 'Le mot de passe doit contenir au moins 8 caractères.' : 'Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      const res = await requestForgotPasswordAdminNotif({
        identifier: targetIdent,
        desiredPassword: targetPwd,
      })

      if (res?.error) {
        setError(res.error)
      } else {
        setSent(true)
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la transmission.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-9 w-9 text-green-600" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-[var(--color-navy-900)] mb-2">
          {lang === 'fr' ? 'Demande transmise à l\'Administration !' : 'Request sent to Administration!'}
        </h1>
        <p className="text-sm text-[var(--color-slate-500)] mb-6 leading-relaxed">
          {lang === 'fr'
            ? <>Votre demande de réinitialisation pour <strong>{identifier}</strong> a été transmise à l'administrateur. Votre mot de passe sera mis à jour sous peu.</>
            : <>Your reset request for <strong>{identifier}</strong> has been sent to the administrator. Your password will be updated shortly.</>}
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-[var(--color-navy-900)] text-white text-sm font-bold hover:bg-[var(--color-navy-950)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {lang === 'fr' ? 'Retour à la connexion' : 'Back to login'}
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-navy-900)]">
          {lang === 'fr' ? 'Réinitialisation de mot de passe' : 'Password Reset Request'}
        </h1>
        <p className="text-sm text-[var(--color-slate-500)] mt-1">
          {lang === 'fr'
            ? 'Indiquez votre identifiant et le nouveau mot de passe souhaité.'
            : 'Enter your identifier and desired new password.'}
        </p>
      </div>

      <Card>
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Identifiant (Email ou Téléphone) */}
            <Input
              label={lang === 'fr' ? 'E-mail ou Numéro de Téléphone' : 'Email or Phone Number'}
              type="text"
              placeholder="Ex: bricelo237@gmail.com ou 652704218"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              icon={<User className="h-4 w-4" />}
              required
            />

            {/* Nouveau mot de passe souhaité */}
            <div className="flex flex-col gap-1.5">
              <Input
                label={lang === 'fr' ? 'Nouveau mot de passe souhaité' : 'Desired new password'}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={desiredPassword}
                onChange={(e) => setDesiredPassword(e.target.value)}
                icon={<Lock className="h-4 w-4" />}
                required
                helper={lang === 'fr' ? 'Au moins 8 caractères' : 'At least 8 characters'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="self-end text-xs text-[var(--color-slate-500)] hover:text-[var(--color-accent)] transition-colors flex items-center gap-1 mt-1"
              >
                {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showPassword ? (lang === 'fr' ? 'Masquer' : 'Hide') : (lang === 'fr' ? 'Afficher' : 'Show')}
              </button>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {lang === 'fr' ? 'Transmettre la demande à l\'Admin' : 'Send request to Admin'}
            </Button>
          </form>
        </CardBody>
      </Card>

      <p className="text-center text-sm text-[var(--color-slate-500)] mt-6">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-[var(--color-accent)] font-semibold hover:underline">
          <ArrowLeft className="h-4 w-4" /> {lang === 'fr' ? 'Retour à la connexion' : 'Back to login'}
        </Link>
      </p>
    </div>
  )
}
