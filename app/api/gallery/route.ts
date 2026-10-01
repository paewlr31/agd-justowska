import { NextResponse } from 'next/server'
import { fail } from '@/lib/errors'
import { cleanMultiline } from '@/lib/format'
import { readImage } from '@/lib/parse'
import { addGalleryItem } from '@/lib/store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const image = await readImage(form)
    if (!image) throw new Error('Wybierz zdjęcie.')
    const caption = cleanMultiline(String(form.get('caption') ?? ''), 200)
    await addGalleryItem(image, caption)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return fail(error)
  }
}
