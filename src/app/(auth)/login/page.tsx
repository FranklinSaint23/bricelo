'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Lock, UserCheck, Smartphone, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardBody } from '@/components/ui/card'
import { useLanguage } from '@/components/providers/language-provider'

function LoginForm() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'
  const registered = searchParams.get('registered')
  const reset = searchParams.get('reset')
  const { t, lang } = useLanguage()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword]     = useState('')
  const [showPwd, setShowPwd]       = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const rawValue = identifier.trim()

    if (!rawValue) {
      setError(t.contactRequired)
      setLoading(false)
      return
    }

    let targetEmail = rawValue

    // Si la valeur saisie n'est pas un e-mail (ne contient pas @), il s'agit d'un numéro de téléphone
    if (!rawValue.includes('@')) {
      const cleanPhone = rawValue.replace(/\D/g, '')

      // 1. Essayer la connexion avec le compte téléphone synthétique
      const syntheticEmail = `${cleanPhone}@bricelo.phone`
      const { error: phoneErr } = await supabase.auth.signInWithPassword({
        email: syntheticEmail,
        password,
      })

      if (!phoneErr) {
        window.location.href = redirect
        return
      }

      // 2. Chercher dans la table public.users si ce téléphone est associé à un e-mail réel
      const { data: userData } = await supabase
        .from('users')
        .select('email')
        .eq('phone', rawValue)
        .maybeSingle()

      if (userData?.email) {
        targetEmail = userData.email
      } else {
        targetEmail = syntheticEmail
      }
    }

    try {
      const { data: signInData, error: err } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      })

      if (err) {
        setError(lang === 'fr' ? 'Identifiants incorrects ou compte inexistant.' : 'Invalid credentials or non-existent account.')
        return
      }

      if (signInData?.user) {
        window.location.href = redirect
      }
    } catch (catchedErr: any) {
      setError(catchedErr.message || 'Erreur de connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardBody className="p-6">
        {registered === '1' && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-xs text-green-800 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-green-600 shrink-0" />
            <span>{lang === 'fr' ? 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.' : 'Account created successfully! You can now log in.'}</span>
          </div>
        )}

        {reset === '1' && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-xs text-green-800 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-green-600 shrink-0" />
            <span>{lang === 'fr' ? 'Mot de passe réinitialisé avec succès ! Connectez-vous avec votre nouveau mot de passe.' : 'Password reset successfully! Log in with your new password.'}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label={t.loginIdentifier}
            type="text"
            placeholder={lang === 'fr' ? 'vous@exemple.com ou 6XX XXX XXX' : 'user@example.com or phone'}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            icon={identifier.includes('@') ? <Mail className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
            required
            autoComplete="username"
          />

          <div className="flex flex-col gap-1.5">
            <Input
              label={t.password}
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="self-end text-xs text-[var(--color-slate-500)] hover:text-[var(--color-accent)] transition-colors flex items-center gap-1"
            >
              {showPwd ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showPwd ? (t.password + ' …') : t.password}
            </button>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-[var(--color-accent)] hover:underline">
              {t.forgotPassword}
            </Link>
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg">
            {t.loginBtn}
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}

export default function LoginPage() {
  const { t } = useLanguage()
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-navy-900)]">{t.loginTitle}</h1>
        <p className="text-sm text-[var(--color-slate-500)] mt-1">{t.loginSub}</p>
      </div>

      <Suspense fallback={<div className="h-64 bg-[var(--color-surface)] rounded-[var(--radius-lg)] animate-pulse" />}>
        <LoginForm />
      </Suspense>

      <p className="text-center text-sm text-[var(--color-slate-500)] mt-6">
        {t.noAccount}{' '}
        <Link href="/register" className="text-[var(--color-accent)] font-medium hover:underline">
          {t.signUpLink}
        </Link>
      </p>
    </div>
  )
}
