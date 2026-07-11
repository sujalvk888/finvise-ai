import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  const authRoutes = ['/login', '/register'];
  const protectedRoutes = ['/dashboard'];

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/register', '/dashboard/:path*'],
};
