import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = [
    '/login',
    '/signup',
    '/forgot-password',
    '/set-password',
    '/verify-otp',
    '/reset-password',
    '/',
    '/api/auth/',
    '/_next',
    '/favicon.ico',
    '/images/',
    '/auth/callback'
  ].some(publicPath => 
    path === publicPath || 
    path.startsWith(publicPath + '/') ||
    path.startsWith('/_next') ||
    path.includes('.')
  );

  // Skip middleware for public paths
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Get the token from cookies or Authorization header
  const token = request.cookies.get('token')?.value || 
               request.headers.get('authorization')?.split(' ')[1] || '';
  
  // If there's no token, redirect to login with the current path as redirect
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  // Clone the request headers and add the Authorization header if it's not already there
  const requestHeaders = new Headers(request.headers);
  if (!requestHeaders.has('authorization') && token) {
    requestHeaders.set('authorization', `Bearer ${token}`);
  }
  

  // Continue with the request with the new headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
