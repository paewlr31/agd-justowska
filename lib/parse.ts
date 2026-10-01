import { cleanLine, cleanMultiline, parsePrice } from '@/lib/format'
import type { ProductInput, UploadedImage } from '@/lib/types'

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

export function imageExtension(contentType: string) {
  const extension = IMAGE_TYPES[contentType]
  if (!extension) throw new Error('Dozwolone formaty zdjęć: JPG, PNG i WEBP.')
  return extension
}

export async function readImage(form: FormData, field = 'image'): Promise<UploadedImage | null> {
  const value = form.get(field)
  if (!(value instanceof File) || value.size === 0) return null
  if (value.size > 8 * 1024 * 1024) throw new Error('Zdjęcie może mieć najwyżej 8 MB.')
  imageExtension(value.type)
  return {
    buffer: Buffer.from(await value.arrayBuffer()),
    contentType: value.type,
    filename: value.name,
  }
}

export function productInputFromForm(form: FormData, image: UploadedImage | null): ProductInput {
  return {
    brand: cleanLine(String(form.get('brand') ?? ''), 80, 'Producent'),
    model: cleanLine(String(form.get('model') ?? ''), 120, 'Model'),
    category: cleanLine(String(form.get('category') ?? ''), 80, 'Typ urządzenia'),
    price: parsePrice(String(form.get('price') ?? '')),
    description: cleanMultiline(String(form.get('description') ?? ''), 4000),
    image,
    removeImage: form.get('removeImage') === '1',
  }
}
