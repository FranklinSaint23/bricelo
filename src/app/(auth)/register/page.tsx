'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, Mail, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardBody } from '@/components/ui/card'

export default function RegisterPage() {
  const router = useRouter()
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
      setError('Le mot de passe doit contenir au moins 8 caractères.')
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
        <h2 className="text-xl font-bold text-[var(--color-navy-900)] mb-2">Vérifiez votre e-mail</h2>
        <p className="text-sm text-[var(--color-slate-500)]">
          Un lien de confirmation vous a été envoyé à <strong>{email}</strong>.
          Cliquez dessus pour activer votre compte.
        </p>
        <Link href="/login" className="inline-block mt-6 text-sm text-[var(--color-accent)] hover:underline">
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-navy-900)]">Créer un compte</h1>
        <p className="text-sm text-[var(--color-slate-500)] mt-1">Rejoignez BRICELO.com gratuitement</p>
      </div>

      <Card>
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Nom complet"
              type="text"
              placeholder="Jean Dupont"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={<User className="h-4 w-4" />}
              required
            />
            <Input
              label="Adresse e-mail"
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              required
              autoComplete="email"
            />
            <Input
              label="Mot de passe"
              type="password"
              placeholder="8 caractères minimum"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              required
              autoComplete="new-password"
              helper="Au moins 8 caractères"
            />

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Créer mon compte
            </Button>

            <p className="text-xs text-center text-[var(--color-slate-400)]">
              En vous inscrivant, vous acceptez nos{' '}
              <Link href="/cgv" className="underline">CGV</Link> et notre{' '}
              <Link href="/confidentialite" className="underline">politique de confidentialité</Link>.
            </p>
          </form>
        </CardBody>
      </Card>

      <p className="text-center text-sm text-[var(--color-slate-500)] mt-6">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-[var(--color-accent)] font-medium hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
