import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './lib/auth'

// Routes that don't require authentication
const publicRoutes = [
  '/login',
  '/verify',
  '/api/auth',
  '/embed', // Public embed routes
  '/api/embed', // Public embed API
]

// Routes that require authentication
const protectedRoutes = [
  '/projects',
  '/admin',
  '/onboarding',
]

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Allow API routes to handle their own auth (except protected ones)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/projects') && !pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users to login for protected routes
  if (isProtectedRoute || pathname.startsWith('/api/projects') || pathname.startsWith('/api/admin')) {
    if (!req.auth?.user) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Home page - redirect to login if not authenticated, otherwise to projects
  if (pathname === '/') {
    if (!req.auth?.user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return NextResponse.redirect(new URL('/projects', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}
