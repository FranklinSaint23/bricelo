import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PROTECTED_PATHS = ['/profil', '/commandes', '/adresses', '/favoris', '/panier', '/checkout']
const VENDOR_PATHS    = ['/vendeur']
const ADMIN_PATHS     = ['/admin']
const AUTH_PATHS      = ['/login', '/register', '/forgot-password']

export async function proxy(request: NextRequest) {
  // Collecter les cookies à mettre à jour pendant getUser()
  const cookiesToApply: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(setCookies) {
          setCookies.forEach((c) => cookiesToApply.push(c as typeof cookiesToApply[0]))
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Rediriger les utilisateurs connectés hors des pages auth
  if (user && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Pages protégées
  if (!user && PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Pages vendeur
  if (VENDOR_PATHS.some((p) => pathname.startsWith(p))) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (!profile || !['vendor', 'admin'].includes(profile.role)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Pages admin
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Construire la réponse finale avec x-user-id dans les headers de requête
  const requestHeaders = new Headers(request.headers)
  if (user) {
    requestHeaders.set('x-user-id', user.id)
  }

  const finalResponse = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // Propager les cookies Supabase refreshés
  cookiesToApply.forEach(({ name, value, options }) => {
    finalResponse.cookies.set(name, value, options as Parameters<typeof finalResponse.cookies.set>[2])
  })

  return finalResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
