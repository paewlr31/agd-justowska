import { NextResponse } from 'next/server'
import { fail } from '@/lib/errors'
import { cleanMultiline } from '@/lib/format'
import { deleteGalleryItem, updateGalleryCaption } from '@/lib/store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Context = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: Context) {
  try {
    const { id } = await context.params
    const body = (await request.json().catch(() => null)) as { caption?: string } | null
    await updateGalleryCaption(id, cleanMultiline(String(body?.caption ?? ''), 200))
    return NextResponse.json({ ok: true })
  } catch (error) {
    return fail(error)
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params
    await deleteGalleryItem(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return fail(error)
  }
}
