import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Development phase routes that should be protected
const DEVELOPMENT_PHASE_ROUTES = [
  '/admin/principal/transfers/create',
  '/admin/principal/transfers',
  '/admin/coordinator/time-table',
  '/admin/coordinator/result-approval',
  '/admin/coordinator/requests',
  '/admin/teachers/request',
  '/admin/teachers/timetable',
  '/admin/teachers/result'
]

// Function to check if current path is a development phase route
function isDevelopmentPhaseRoute(pathname: string): boolean {
  return DEVELOPMENT_PHASE_ROUTES.some(route => pathname === route)
}

// Function to get the previous route based on current path
function getPreviousRoute(pathname: string): string {
  if (pathname.includes('/principal/')) {
    return '/admin'
  } else if (pathname.includes('/coordinator/')) {
    return '/admin/coordinator'
  } else if (pathname.includes('/teachers/')) {
    return '/admin/teachers'
  }
  return '/admin'
}

// Function to get feature name based on current path
function getFeatureName(pathname: string): string {
  if (pathname.includes('transfers')) {
    return 'Transfer Management'
  } else if (pathname.includes('time-table')) {
    return 'Time Table Management'
  } else if (pathname.includes('result-approval')) {
    return 'Result Approval'
  } else if (pathname.includes('requests')) {
    return 'Request Management'
  } else if (pathname.includes('timetable')) {
    return 'Teacher Timetable'
  } else if (pathname.includes('result')) {
    return 'Result Management'
  }
  return 'Feature'
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if current route is a development phase route
  if (isDevelopmentPhaseRoute(pathname)) {
    // Create a redirect URL with development phase parameters
    const redirectUrl = new URL('/development-phase', request.url)
    
    // Add parameters to the redirect URL
    redirectUrl.searchParams.set('feature', getFeatureName(pathname))
    redirectUrl.searchParams.set('previous', getPreviousRoute(pathname))
    redirectUrl.searchParams.set('route', pathname)
    
    // Redirect to development phase page
    return NextResponse.redirect(redirectUrl)
  }

  // Allow normal navigation for non-development routes
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/admin/principal/transfers/:path*',
    '/admin/coordinator/time-table',
    '/admin/coordinator/result-approval',
    '/admin/coordinator/requests',
    '/admin/teachers/request',
    '/admin/teachers/timetable',
    '/admin/teachers/result'
  ]
}
