import { cleanLine, cleanMultiline, parsePrice } from '@/lib/format'
import { parseEnergyClass } from '@/lib/energy'
import { assertAllowedFile } from '@/lib/media'
import type { ProductInput, UploadedImage } from '@/lib/types'

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/gif': '.gif',
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

export async function readUploads(form: FormData, field: string) {
  const values = form.getAll(field).filter((value): value is File => value instanceof File && value.size > 0)
  if (values.length > 12) throw new Error('Naraz można dodać najwyżej 12 plików.')
  const uploads: UploadedImage[] = []
  for (const value of values) {
    if (value.size > 20 * 1024 * 1024) throw new Error(`„${value.name}” ma więcej niż 20 MB.`)
    assertAllowedFile(value.name || 'plik')
    uploads.push({
      buffer: Buffer.from(await value.arrayBuffer()),
      contentType: value.type || 'application/octet-stream',
      filename: value.name || 'plik',
    })
  }
  return uploads
}

export async function productInputFromForm(form: FormData): Promise<ProductInput> {
  return {
    brand: cleanLine(String(form.get('brand') ?? ''), 80, 'Producent'),
    model: cleanLine(String(form.get('model') ?? ''), 120, 'Model'),
    category: cleanLine(String(form.get('category') ?? ''), 80, 'Typ urządzenia'),
    price: parsePrice(String(form.get('price') ?? '')),
    description: cleanMultiline(String(form.get('description') ?? ''), 12000, 'Opis'),
    features: cleanMultiline(String(form.get('features') ?? ''), 8000, 'Cechy'),
    energyClass: parseEnergyClass(String(form.get('energyClass') ?? '')),
    images: await readUploads(form, 'images'),
    files: await readUploads(form, 'files'),
    imageOrder: form.getAll('imageOrder').map(String),
    removeImages: form.getAll('removeImages').map(String),
    removeFiles: form.getAll('removeFiles').map(String),
  }
}
