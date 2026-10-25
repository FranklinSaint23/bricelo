import posthog from 'posthog-js'

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

if (typeof window !== 'undefined') {
  if (posthogKey && posthogHost) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      defaults: '2026-01-30',
      capture_pageview: true,
      capture_pageleave: true,
      capture_exceptions: true,
      debug: process.env.NODE_ENV === 'development',
    })
  } else if (process.env.NODE_ENV === 'development') {
    console.warn('Variables PostHog manquantes (NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ou NEXT_PUBLIC_POSTHOG_HOST)')
  }
}
