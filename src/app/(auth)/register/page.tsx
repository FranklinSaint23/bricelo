'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, Mail, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardBody } from '@/components/ui/card'
import { useLanguage } from '@/components/providers/language-provider'

export default function RegisterPage() {
  const router = useRouter()
  const { t, lang } = useLanguage()
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError(lang === 'fr' ? 'Le mot de passe doit contenir au moins 8 caractères.' : 'Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="text-5xl mb-4">📬</div>
        <h2 className="text-xl font-bold text-[var(--color-navy-900)] mb-2">
          {lang === 'fr' ? 'Vérifiez votre e-mail' : 'Check your email'}
        </h2>
        <p className="text-sm text-[var(--color-slate-500)]">
          {lang === 'fr'
            ? <>Un lien de confirmation vous a été envoyé à <strong>{email}</strong>. Cliquez dessus pour activer votre compte.</>
            : <>A confirmation link was sent to <strong>{email}</strong>. Click it to activate your account.</>}
        </p>
        <Link href="/login" className="inline-block mt-6 text-sm text-[var(--color-accent)] hover:underline">
          {t.loginLink}
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-navy-900)]">{t.registerTitle}</h1>
        <p className="text-sm text-[var(--color-slate-500)] mt-1">{t.registerSub}</p>
      </div>

      <Card>
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label={t.fullName.replace(' *', '')}
              type="text"
              placeholder="Jean Dupont"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={<User className="h-4 w-4" />}
              required
            />
            <Input
              label={t.email}
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              required
              autoComplete="email"
            />
            <Input
              label={t.password}
              type="password"
              placeholder={lang === 'fr' ? '8 caractères minimum' : 'At least 8 characters'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              required
              autoComplete="new-password"
              helper={lang === 'fr' ? 'Au moins 8 caractères' : 'At least 8 characters'}
            />

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {t.registerBtn}
            </Button>

            <p className="text-xs text-center text-[var(--color-slate-400)]">
              {lang === 'fr'
                ? <>En vous inscrivant, vous acceptez nos <Link href="/cgv" className="underline">CGV</Link> et notre <Link href="/confidentialite" className="underline">politique de confidentialité</Link>.</>
                : <>By signing up, you agree to our <Link href="/cgv" className="underline">Terms</Link> and <Link href="/confidentialite" className="underline">Privacy Policy</Link>.</>}
            </p>
          </form>
        </CardBody>
      </Card>

      <p className="text-center text-sm text-[var(--color-slate-500)] mt-6">
        {t.hasAccount}{' '}
        <Link href="/login" className="text-[var(--color-accent)] font-medium hover:underline">
          {t.loginLink}
        </Link>
      </p>
    </div>
  )
}
