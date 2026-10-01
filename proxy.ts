import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/panel/login' || pathname === '/api/auth/login' || pathname === '/api/auth/logout') {
    return NextResponse.next()
  }

  const isPanel = pathname === '/panel' || pathname.startsWith('/panel/')
  const isMutation = pathname.startsWith('/api/') && request.method !== 'GET' && request.method !== 'HEAD'
  if (!isPanel && !isMutation) return NextResponse.next()

  const allowed = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET)
  if (allowed) return NextResponse.next()

  if (isPanel) {
    const url = request.nextUrl.clone()
    url.pathname = '/panel/login'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.json({ error: 'Brak dostępu. Zaloguj się w panelu.' }, { status: 401 })
}

export const config = {
  matcher: ['/panel', '/panel/:path*', '/api/:path*'],
}
