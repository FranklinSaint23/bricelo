'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Lock, User, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react'
import { requestForgotPasswordAdminNotif, checkPasswordResetStatusAction } from '@/app/(admin)/admin/utilisateurs/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardBody } from '@/components/ui/card'
import { useLanguage } from '@/components/providers/language-provider'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const [identifier, setIdentifier]           = useState('')
  const [desiredPassword, setDesiredPassword] = useState('')
  const [showPassword, setShowPassword]       = useState(false)
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState<string | null>(null)
  const [sent, setSent]                       = useState(false)
  const [resetId, setResetId]                 = useState<string | undefined>()
  const [isCompleted, setIsCompleted]         = useState(false)

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
        setResetId(res.resetId)
        setSent(true)
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la transmission.')
    } finally {
      setLoading(false)
    }
  }

  // Polling automatique si en attente
  useEffect(() => {
    if (!sent || isCompleted) return

    const interval = setInterval(async () => {
      const res = await checkPasswordResetStatusAction(identifier, resetId)
      if (res.status === 'completed') {
        setIsCompleted(true)
        clearInterval(interval)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [sent, isCompleted, identifier, resetId])

  if (sent) {
    return (
      <div className="w-full max-w-md text-center">
        {isCompleted ? (
          /* VUE : L'ADMIN A VALIDÉ LE MOT DE PASSE */
          <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-emerald-400 shadow-xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
            </div>
            <h1 className="text-xl font-extrabold text-[var(--color-navy-900)] mb-2 flex items-center justify-center gap-1.5">
              <Sparkles className="h-5 w-5 text-amber-500" />
              {lang === 'fr' ? 'Votre mot de passe a été mis à jour par l\'administration !' : 'Your password has been updated by the admin!'}
            </h1>
            <p className="text-sm text-[var(--color-slate-600)] mb-6 leading-relaxed">
              {lang === 'fr'
                ? <>L'administrateur a validé le changement pour <strong>{identifier}</strong>. Vous pouvez dès à présent accéder à votre compte avec votre nouveau mot de passe.</>
                : <>The administrator has approved the change for <strong>{identifier}</strong>. You can now log into your account with your new password.</>}
            </p>

            <Button
              onClick={() => router.push('/login')}
              size="lg"
              className="w-full font-extrabold py-4 text-base bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-md"
            >
              {lang === 'fr' ? 'Se connecter' : 'Log In'}
            </Button>
          </div>
        ) : (
          /* VUE : EN ATTENTE DE LA VALIDATION ADMIN */
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[var(--color-slate-200)] shadow-lg">
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center">
                <Loader2 className="h-7 w-7 text-amber-600 animate-spin" />
              </div>
            </div>
            <h1 className="text-lg font-bold text-[var(--color-navy-900)] mb-2">
              {lang === 'fr' ? 'Demande transmise à l\'Administration !' : 'Request sent to Administration!'}
            </h1>
            <p className="text-xs text-[var(--color-slate-500)] mb-5 leading-relaxed">
              {lang === 'fr'
                ? <>L'administrateur a reçu une alerte e-mail concernant <strong>{identifier}</strong> et met à jour votre mot de passe. Veuillez patienter sur cette page...</>
                : <>The administrator received an email notification for <strong>{identifier}</strong> and is updating your password. Please wait on this page...</>}
            </p>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 mb-6 flex items-center justify-center gap-2 text-xs font-semibold text-amber-900">
              <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
              <span>{lang === 'fr' ? 'En attente de validation par l\'administration...' : 'Waiting for admin validation...'}</span>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 text-xs font-bold text-[var(--color-slate-500)] hover:text-[var(--color-navy-900)] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {lang === 'fr' ? 'Retour à la connexion' : 'Back to login'}
            </Link>
          </div>
        )}
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
