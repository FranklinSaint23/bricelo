'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardBody } from '@/components/ui/card'
import { useLanguage } from '@/components/providers/language-provider'

export default function ForgotPasswordPage() {
  const { t, lang } = useLanguage()
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [sent, setSent]       = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const targetEmail = email.trim()

    if (!targetEmail) {
      setError(lang === 'fr' ? 'Veuillez entrer votre adresse e-mail' : 'Please enter your email')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bricelo.cm'
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: `${origin}/reset-password`,
      })

      if (resetErr) {
        setError(resetErr.message)
      } else {
        setSent(true)
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réinitialisation.')
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
          {lang === 'fr' ? 'E-mail de réinitialisation envoyé !' : 'Reset email sent!'}
        </h1>
        <p className="text-sm text-[var(--color-slate-500)] mb-6 leading-relaxed">
          {lang === 'fr'
            ? <>Un lien sécurisé de réinitialisation a été envoyé à <strong>{email}</strong>. Consultez votre boîte de réception et vos spams.</>
            : <>A secure reset link was sent to <strong>{email}</strong>. Check your inbox and spam folder.</>}
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
          {lang === 'fr' ? 'Mot de passe oublié ?' : 'Forgot Password?'}
        </h1>
        <p className="text-sm text-[var(--color-slate-500)] mt-1">
          {lang === 'fr'
            ? 'Saisissez votre e-mail pour recevoir un lien de réinitialisation.'
            : 'Enter your email to receive a password reset link.'}
        </p>
      </div>

      <Card>
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label={lang === 'fr' ? 'Adresse e-mail' : 'Email address'}
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              required
              autoComplete="email"
            />

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {lang === 'fr' ? 'Envoyer le lien de réinitialisation' : 'Send reset link'}
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
