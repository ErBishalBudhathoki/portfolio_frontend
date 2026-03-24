import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the request is for the admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_session')?.value
    const expectedToken = process.env.ADMIN_SESSION_TOKEN

    if (!token || !expectedToken || token !== expectedToken) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('admin_session')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*'
}
