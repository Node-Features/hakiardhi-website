import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Frontend Middleware - Minimal Authentication Check
 *
 * NOTE: This middleware runs on the server and CANNOT access localStorage.
 * Since our auth system uses localStorage for tokens, we rely on:
 * 1. ProtectedRoute component for actual route protection (client-side)
 * 2. Backend middleware for API protection (server-side)
 *
 * This middleware only handles:
 * - Redirecting authenticated users away from auth pages
 * - Allowing static files
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes (signin, signup, etc.)
  const publicRoutes = ['/signin', '/signup', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Allow static files, API routes, and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') // Files with extensions (css, js, images, etc.)
  ) {
    return NextResponse.next();
  }

  // For public routes (signin, signup, etc.), just allow through
  // The page itself will handle redirects if user is already authenticated
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, allow through
  // ProtectedRoute component will handle authentication checks on client-side
  // This is necessary because we can't access localStorage in middleware
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
