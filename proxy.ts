/**
 * @system     FlowAluminio
 * @module     proxy.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Proxy de autenticación — protege rutas por sesión y por rol
 *             NOTA: En Next.js 16 el archivo se llama proxy.ts (no middleware.ts)
 */
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ROLE_DASHBOARDS, ROLE_ALLOWED_PREFIXES } from '@/lib/roles'

const PUBLIC_ROUTES  = ['/login', '/reset-password']
const ROLE_PREFIXES  = ['/superadmin', '/admin', '/comercial', '/operaciones', '/dashboard/']

async function getUserRol(supabase: ReturnType<typeof createServerClient>, userId: string) {
  const { data } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', userId)
    .single()
  return data?.rol as string | undefined
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r))

  // Sin sesión → login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (!user) return supabaseResponse

  // Con sesión → obtener rol una sola vez
  const rol = await getUserRol(supabase, user.id)

  // En login → redirigir al dashboard del rol
  if (pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = ROLE_DASHBOARDS[rol ?? ''] ?? '/login'
    return NextResponse.redirect(url)
  }

  // /dashboard (sin sufijo) → dashboard del rol
  if (pathname === '/dashboard') {
    const url = request.nextUrl.clone()
    url.pathname = ROLE_DASHBOARDS[rol ?? ''] ?? '/login'
    return NextResponse.redirect(url)
  }

  // Verificar acceso por rol en rutas protegidas
  const isProtectedRoute = ROLE_PREFIXES.some((p) => pathname.startsWith(p))
  if (isProtectedRoute && rol) {
    const allowed = ROLE_ALLOWED_PREFIXES[rol] ?? []
    const isAllowed = allowed.some((prefix) => pathname.startsWith(prefix))
    if (!isAllowed) {
      const url = request.nextUrl.clone()
      url.pathname = ROLE_DASHBOARDS[rol] ?? '/login'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
