'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardBody } from '@/components/ui/card'

function LoginForm() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError(err.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : err.message)
      setLoading(false)
      return
    }
    window.location.href = redirect
  }

  return (
    <Card>
      <CardBody className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

          <div className="flex flex-col gap-1.5">
            <Input
              label="Mot de passe"
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
              className="self-end text-xs text-[var(--color-slate-500)] hover:text-[var(--color-accent)] transition-colors"
            >
              {showPwd ? 'Masquer' : 'Afficher'} le mot de passe
            </button>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-[var(--color-accent)] hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Se connecter
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-navy-900)]">Connexion</h1>
        <p className="text-sm text-[var(--color-slate-500)] mt-1">Bienvenue sur BRICELO.com</p>
      </div>

      <Suspense fallback={<div className="h-64 bg-white rounded-[var(--radius-lg)] animate-pulse" />}>
        <LoginForm />
      </Suspense>

      <p className="text-center text-sm text-[var(--color-slate-500)] mt-6">
        Pas encore de compte ?{' '}
        <Link href="/register" className="text-[var(--color-accent)] font-medium hover:underline">
          S'inscrire gratuitement
        </Link>
      </p>
    </div>
  )
}
