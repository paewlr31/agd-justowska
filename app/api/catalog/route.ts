import { NextResponse } from 'next/server'
import { fail } from '@/lib/errors'
import { getCatalog } from '@/lib/store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    return NextResponse.json(await getCatalog(), { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return fail(error)
  }
}
