'use client'

import { useEffect, useRef } from 'react'
import '@/instrumentation-client'
import posthog from 'posthog-js'
import { createClient } from '@/lib/supabase/client'
import { ThemeProvider } from './theme-provider'
import { LanguageProvider } from './language-provider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const identifiedUserId = useRef<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const posthogConfigured = Boolean(
      process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST,
    )

    const identifyUser = (user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) => {
      if (!posthogConfigured || identifiedUserId.current === user.id) return

      if (identifiedUserId.current && identifiedUserId.current !== user.id) {
        posthog.reset()
      }

      posthog.identify(user.id, {
        email: user.email,
        name: typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : undefined,
      })
      identifiedUserId.current = user.id
    }

    const resetPostHog = () => {
      if (posthogConfigured && identifiedUserId.current) posthog.reset()
      identifiedUserId.current = null
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        resetPostHog()
        return
      }

      if (session?.user) identifyUser(session.user)
    })

    const handleSignOut = (event: SubmitEvent) => {
      const form = event.target
      if (form instanceof HTMLFormElement && form.action.endsWith('/api/auth/signout')) {
        resetPostHog()
      }
    }

    document.addEventListener('submit', handleSignOut)
    return () => {
      subscription.unsubscribe()
      document.removeEventListener('submit', handleSignOut)
    }
  }, [])

  return (
    <ThemeProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </ThemeProvider>
  )
}
