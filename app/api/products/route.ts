import { NextResponse } from 'next/server'
import { fail } from '@/lib/errors'
import { productInputFromForm, readImage } from '@/lib/parse'
import { addProduct } from '@/lib/store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const id = await addProduct(productInputFromForm(form, await readImage(form)))
    return NextResponse.json({ ok: true, id })
  } catch (error) {
    return fail(error)
  }
}
