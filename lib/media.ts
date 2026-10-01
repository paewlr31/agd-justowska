import sharp from 'sharp'
import { parseEnergyClass } from '@/lib/energy'

export { parseEnergyClass }

const BLOCKED = new Set(['exe', 'bat', 'cmd', 'com', 'msi', 'js', 'mjs', 'cjs', 'html', 'htm', 'svg', 'php', 'sh', 'ps1', 'dll', 'scr'])
const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'bmp', 'tif', 'tiff', 'heic', 'heif'])

export function fileExtension(filename: string) {
  const match = filename.toLowerCase().match(/\.([a-z0-9]+)$/)
  return match?.[1] ?? ''
}

export function assertAllowedFile(filename: string) {
  const extension = fileExtension(filename)
  if (!extension || BLOCKED.has(extension)) throw new Error(`Plik „${filename}” ma niedozwolone rozszerzenie.`)
  return extension
}

export function isRasterImage(filename: string, contentType: string) {
  if (contentType === 'image/svg+xml') return false
  if (contentType.startsWith('image/')) return true
  return IMAGE_EXT.has(fileExtension(filename))
}

export function contentTypeFor(filename: string, fallback: string) {
  const extension = fileExtension(filename)
  const types: Record<string, string> = {
    pdf: 'application/pdf',
    zip: 'application/zip',
    txt: 'text/plain',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }
  return types[extension] ?? (fallback || 'application/octet-stream')
}

export async function normalizeProductImage(buffer: Buffer, filename: string) {
  try {
    return await sharp(buffer, { failOn: 'none', pages: 1 })
      .rotate()
      .resize(1200, 900, {
        fit: 'contain',
        background: { r: 246, g: 240, b: 235, alpha: 1 },
      })
      .webp({ quality: 82 })
      .toBuffer()
  } catch {
    throw new Error(`Nie udało się odczytać zdjęcia „${filename}”. Zapisz je jako JPG, PNG, WEBP albo AVIF.`)
  }
}
