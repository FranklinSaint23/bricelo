'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardBody } from '@/components/ui/card'
import { useLanguage } from '@/components/providers/language-provider'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const [password, setPassword]       = useState('')
  const [confirmPwd, setConfirmPwd]   = useState('')
  const [showPwd, setShowPwd]         = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [success, setSuccess]         = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError(lang === 'fr' ? 'Le mot de passe doit contenir au moins 8 caractères.' : 'Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPwd) {
      setError(lang === 'fr' ? 'Les mots de passe ne correspondent pas.' : 'Passwords do not match.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password,
      })

      if (updateErr) {
        setError(updateErr.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login?reset=1')
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement de mot de passe.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-9 w-9 text-green-600" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-[var(--color-navy-900)] mb-2">
          {lang === 'fr' ? 'Mot de passe modifié avec succès !' : 'Password updated successfully!'}
        </h1>
        <p className="text-sm text-[var(--color-slate-500)] mb-6">
          {lang === 'fr' ? 'Redirection vers la page de connexion...' : 'Redirecting to login...'}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-navy-900)]">
          {lang === 'fr' ? 'Nouveau mot de passe' : 'New Password'}
        </h1>
        <p className="text-sm text-[var(--color-slate-500)] mt-1">
          {lang === 'fr' ? 'Saisissez votre nouveau mot de passe ci-dessous.' : 'Enter your new password below.'}
        </p>
      </div>

      <Card>
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label={lang === 'fr' ? 'Nouveau mot de passe' : 'New password'}
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              required
              autoComplete="new-password"
            />

            <Input
              label={lang === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'}
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              required
              autoComplete="new-password"
            />

            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="self-end text-xs text-[var(--color-slate-500)] hover:text-[var(--color-accent)] transition-colors flex items-center gap-1"
            >
              {showPwd ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showPwd ? (lang === 'fr' ? 'Masquer' : 'Hide') : (lang === 'fr' ? 'Afficher' : 'Show')}
            </button>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {lang === 'fr' ? 'Mettre à jour le mot de passe' : 'Update password'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
