import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = [
  '/',
  '/melden',
  '/sofortanleitung',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
]

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true
  if (pathname.startsWith('/melden/')) return true
  if (pathname.startsWith('/auth/')) return true
  if (pathname.startsWith('/api/')) return true
  return false
}

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin')
}

function isJaegerRoute(pathname: string): boolean {
  return pathname.startsWith('/dashboard') || pathname.startsWith('/reviere')
}

function isProtectedRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/reviere') ||
    pathname.startsWith('/admin')
  )
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          if (headers) {
            Object.entries(headers).forEach(([key, value]) =>
              supabaseResponse.headers.set(key, value)
            )
          }
        },
      },
    }
  )

  // IMPORTANT: Do not run code between createServerClient and getClaims()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  const { pathname } = request.nextUrl

  // Redirect unauthenticated users away from protected routes
  if (!user && isProtectedRoute(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // Role-based guards (single DB query covers both checks)
  if (user && (isAdminRoute(pathname) || isJaegerRoute(pathname))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.sub)
      .single()

    if (isAdminRoute(pathname) && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (isJaegerRoute(pathname) && profile?.role === 'user') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|leaflet/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
