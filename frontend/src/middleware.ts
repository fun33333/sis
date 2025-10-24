import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow Universal_Login page and Next.js static files
  if (
    pathname === '/Universal_Login' ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Check for authentication token in cookies or headers
  const token = request.cookies.get('sis_access_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // If no token found, redirect to login
  if (!token) {
    const loginUrl = new URL('/Universal_Login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Allow authenticated users to proceed
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/((?!Universal_Login|_next/static|_next/image|favicon.ico|api).*)',
  ]
}
