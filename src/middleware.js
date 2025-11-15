import { NextResponse } from 'next/server'

export async function middleware(request) {
  // Simple admin route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for admin session cookie or redirect to login
    const adminSession = request.cookies.get('admin-session')
    
    if (!adminSession && request.nextUrl.pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
