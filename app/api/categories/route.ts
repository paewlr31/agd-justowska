import { NextResponse } from 'next/server'
import { fail } from '@/lib/errors'
import { addCategory, deleteCategory } from '@/lib/store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function readBody(request: Request) {
  const body = (await request.json().catch(() => null)) as { brand?: string; name?: string } | null
  return { brand: String(body?.brand ?? ''), name: String(body?.name ?? '') }
}

export async function POST(request: Request) {
  try {
    const { brand, name } = await readBody(request)
    const category = await addCategory(brand, name)
    return NextResponse.json({ ok: true, category })
  } catch (error) {
    return fail(error)
  }
}

export async function DELETE(request: Request) {
  try {
    const { brand, name } = await readBody(request)
    await deleteCategory(brand, name)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return fail(error)
  }
}
