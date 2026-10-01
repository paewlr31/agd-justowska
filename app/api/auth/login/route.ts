import { timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from '@/lib/auth'

export const runtime = 'nodejs'

function sameSecret(input: string, expected: string) {
  const left = Buffer.from(input)
  const right = Buffer.from(expected)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

export async function POST(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD
  const sessionSecret = process.env.SESSION_SECRET
  if (!adminPassword || !sessionSecret) {
    return NextResponse.json({ error: 'Panel nie ma ustawionego hasła. Uzupełnij ADMIN_PASSWORD i SESSION_SECRET.' }, { status: 503 })
  }
  const body = (await request.json().catch(() => null)) as { password?: string } | null
  const password = body?.password ?? ''
  if (!sameSecret(password, adminPassword)) {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return NextResponse.json({ error: 'Nieprawidłowe hasło.' }, { status: 401 })
  }
  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, await createSessionToken(sessionSecret), sessionCookieOptions())
  return response
}
