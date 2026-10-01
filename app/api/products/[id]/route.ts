import { NextResponse } from 'next/server'
import { fail } from '@/lib/errors'
import { productInputFromForm, readImage } from '@/lib/parse'
import { deleteProduct, updateProduct } from '@/lib/store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Context = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: Context) {
  try {
    const { id } = await context.params
    const form = await request.formData()
    await updateProduct(id, productInputFromForm(form, await readImage(form)))
    return NextResponse.json({ ok: true })
  } catch (error) {
    return fail(error)
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params
    await deleteProduct(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return fail(error)
  }
}
