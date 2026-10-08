import { randomUUID } from 'crypto'
import fs from 'fs'
import path from 'path'
import { unstable_noStore as noStore } from 'next/cache'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import seedJson from '@/data/seed.json'
import { contentTypeFor, fileExtension, isRasterImage, normalizeProductImage } from '@/lib/media'
import { imageExtension } from '@/lib/parse'
import type { Catalog, GalleryItem, Manufacturer, Product, ProductFile, ProductInput, UploadedImage } from '@/lib/types'

const seed = seedJson as Catalog
const dbFile = path.join(process.cwd(), 'data', 'db.json')
const OFFLINE_MESSAGE = 'Zapis w internecie wymaga darmowej bazy Supabase. Instrukcja jest w pliku README.md.'

let supabaseClient: SupabaseClient | null = null

export function databaseMode(): 'supabase' | 'local' {
  return process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY ? 'supabase' : 'local'
}

function supabase() {
  if (!supabaseClient) {
    supabaseClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return supabaseClient
}

function assertCatalog(value: unknown): Catalog {
  if (!value || typeof value !== 'object') throw new Error('Uszkodzony plik bazy.')
  const catalog = value as Catalog
  if (!Array.isArray(catalog.manufacturers) || !Array.isArray(catalog.products) || !Array.isArray(catalog.gallery)) {
    throw new Error('Uszkodzony plik bazy.')
  }
  return catalog
}

function normalizeProduct(product: Product): Product {
  const fromList = Array.isArray(product.images) ? product.images.filter(Boolean) : []
  const images = fromList.length ? fromList : product.image ? [product.image] : []
  return {
    ...product,
    description: product.description ?? '',
    features: product.features ?? '',
    energyClass: product.energyClass ?? null,
    files: Array.isArray(product.files) ? product.files : [],
    images,
    image: images[0] ?? null,
  }
}

function databaseError(message: string) {
  if (/column .* does not exist|schema cache/i.test(message)) {
    return 'W Supabase uruchom plik supabase/migration-product-media.sql. Dotychczasowe produkty zostaną na miejscu.'
  }
  return message
}

function present(catalog: Catalog): Catalog {
  const manufacturers = [...catalog.manufacturers].sort((a, b) => a.sortOrder - b.sortOrder)
  const byName = new Map(manufacturers.map((item) => [item.name, item]))
  const products = catalog.products.map((product) => normalizeProduct(product)).sort((a, b) => {
    const brandA = byName.get(a.brand)?.sortOrder ?? 99
    const brandB = byName.get(b.brand)?.sortOrder ?? 99
    if (brandA !== brandB) return brandA - brandB
    const categories = byName.get(a.brand)?.categories ?? []
    const categoryA = categories.indexOf(a.category)
    const categoryB = (byName.get(b.brand)?.categories ?? []).indexOf(b.category)
    if (categoryA !== categoryB) return categoryA - categoryB
    return a.model.localeCompare(b.model, 'pl')
  })
  const gallery = [...catalog.gallery].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))
  return { manufacturers, products, gallery }
}

function loadLocal(): Catalog {
  const catalog = fs.existsSync(dbFile) ? assertCatalog(JSON.parse(fs.readFileSync(dbFile, 'utf8'))) : structuredClone(seed)
  catalog.products = catalog.products.map((product) => normalizeProduct(product))
  if (!fs.existsSync(dbFile) && !process.env.VERCEL) {
    fs.mkdirSync(path.dirname(dbFile), { recursive: true })
    fs.writeFileSync(dbFile, JSON.stringify(catalog, null, 2))
  }
  return catalog
}

function saveLocal(catalog: Catalog) {
  if (process.env.VERCEL) throw new Error(OFFLINE_MESSAGE)
  fs.mkdirSync(path.dirname(dbFile), { recursive: true })
  fs.writeFileSync(dbFile, JSON.stringify(catalog, null, 2))
}

function manufacturerOrThrow(catalog: Catalog, brand: string) {
  const manufacturer = catalog.manufacturers.find((item) => item.name === brand)
  if (!manufacturer) throw new Error('Wybierz producenta z listy.')
  return manufacturer
}

function requireCategory(manufacturer: Manufacturer, category: string) {
  if (!manufacturer.categories.includes(category)) {
    throw new Error('Wybierz typ urządzenia z listy tej marki. Nowy typ dodaje się osobno.')
  }
}

function localImagePath(url: string | null) {
  if (!url || !url.startsWith('/uploads/')) return null
  return path.join(process.cwd(), 'public', 'uploads', path.basename(url.split('?')[0]))
}

function removeLocalImage(url: string | null) {
  const file = localImagePath(url)
  if (file && fs.existsSync(file)) fs.unlinkSync(file)
}

function writeLocalImage(id: string, image: UploadedImage) {
  const filename = `${id}${imageExtension(image.contentType)}`
  const directory = path.join(process.cwd(), 'public', 'uploads')
  fs.mkdirSync(directory, { recursive: true })
  fs.writeFileSync(path.join(directory, filename), image.buffer)
  return `/uploads/${filename}?v=${Date.now()}`
}

function sameStoredFile(left: string | null, right: string | null) {
  if (!left || !right) return false
  const remoteLeft = storagePath(left)
  const remoteRight = storagePath(right)
  if (remoteLeft || remoteRight) return remoteLeft === remoteRight
  return path.basename(left.split('?')[0]) === path.basename(right.split('?')[0])
}

function storagePath(url: string | null) {
  if (!url) return null
  const marker = '/storage/v1/object/public/media/'
  const clean = url.split('?')[0]
  const index = clean.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(clean.slice(index + marker.length))
}

async function removeRemoteImage(url: string | null) {
  const objectPath = storagePath(url)
  if (!objectPath) return
  await supabase().storage.from('media').remove([objectPath])
}

async function writeRemoteImage(folder: string, id: string, image: UploadedImage) {
  const objectPath = `${folder}/${id}${imageExtension(image.contentType)}`
  const { error } = await supabase().storage.from('media').upload(objectPath, new Uint8Array(image.buffer), {
    contentType: image.contentType,
    upsert: true,
  })
  if (error) throw new Error(`Nie udało się zapisać zdjęcia: ${error.message}`)
  const { data } = supabase().storage.from('media').getPublicUrl(objectPath)
  return `${data.publicUrl}?v=${Date.now()}`
}

function asPrice(value: unknown) {
  if (value == null || value === '') return null
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) ? number : null
}

function asFiles(value: unknown): ProductFile[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is { url?: string; name?: string } => Boolean(item) && typeof item === 'object')
    .filter((item) => typeof item.url === 'string')
    .map((item) => ({ url: item.url as string, name: item.name || 'Plik' }))
}

async function readSupabase(): Promise<Catalog> {
  const db = supabase()
  const [manufacturers, gallery] = await Promise.all([
    db.from('manufacturers').select('slug, name, categories, sort_order').order('sort_order'),
    db.from('gallery').select('id, image_url, caption, created_at'),
  ])
  let products = await db.from('products').select('id, brand, model, category, price, description, features, energy_class, image_url, images, files, created_at')
  if (products.error && /column .* does not exist|schema cache/i.test(products.error.message)) {
    products = await db.from('products').select('id, brand, model, category, price, description, image_url, created_at')
  }
  const failure = manufacturers.error?.message || products.error?.message || gallery.error?.message
  if (failure) {
    if (failure.includes('does not exist') || failure.includes('schema cache')) {
      throw new Error('Baza Supabase nie ma jeszcze tabel. Wklej plik supabase/schema.sql w SQL Editorze.')
    }
    throw new Error(failure)
  }
  return {
    manufacturers: (manufacturers.data ?? []).map((row) => ({
      slug: row.slug,
      name: row.name,
      categories: row.categories ?? [],
      sortOrder: row.sort_order,
    })),
    products: (products.data ?? []).map((row) => {
      const record = row as typeof row & { features?: string; energy_class?: string | null; images?: string[] | null; files?: unknown }
      const fromList = Array.isArray(record.images) ? record.images.filter(Boolean) : []
      const images = fromList.length ? fromList : record.image_url ? [record.image_url] : []
      return normalizeProduct({
        id: record.id,
        brand: record.brand,
        model: record.model,
        category: record.category,
        price: asPrice(record.price),
        description: record.description ?? '',
        features: record.features ?? '',
        energyClass: record.energy_class ?? null,
        image: images[0] ?? null,
        images,
        files: asFiles(record.files),
        createdAt: record.created_at,
      })
    }),
    gallery: (gallery.data ?? []).map((row) => ({
      id: row.id,
      image: row.image_url,
      caption: row.caption ?? '',
      createdAt: row.created_at,
    })),
  }
}

export async function getCatalog() {
  noStore()
  const catalog = databaseMode() === 'supabase' ? await readSupabase() : loadLocal()
  return present(catalog)
}

function assertWritable() {
  if (databaseMode() === 'local' && process.env.VERCEL) throw new Error(OFFLINE_MESSAGE)
}

function sameCategory(left: string, right: string) {
  return left.localeCompare(right, 'pl', { sensitivity: 'accent' }) === 0
}

async function persistProductImage(id: string, image: UploadedImage) {
  assertWritable()
  return databaseMode() === 'supabase' ? writeRemoteImage('products', id, image) : writeLocalImage(id, image)
}

async function persistGalleryImage(id: string, image: UploadedImage) {
  if (process.env.VERCEL && databaseMode() !== 'supabase') throw new Error(OFFLINE_MESSAGE)
  return databaseMode() === 'supabase' ? writeRemoteImage('gallery', id, image) : writeLocalImage(id, image)
}

async function discardImage(url: string | null) {
  if (databaseMode() === 'supabase') await removeRemoteImage(url)
  else removeLocalImage(url)
}

export async function addCategory(brand: string, name: string) {
  assertWritable()
  const category = name.replace(/\s+/g, ' ').trim()
  if (category.length < 2 || category.length > 80) throw new Error('Nazwa typu urządzenia powinna mieć od 2 do 80 znaków.')
  const catalog = databaseMode() === 'supabase' ? await readSupabase() : loadLocal()
  const manufacturer = manufacturerOrThrow(catalog, brand)
  const existing = manufacturer.categories.find((item) => sameCategory(item, category))
  if (existing) return existing
  manufacturer.categories.push(category)
  if (databaseMode() === 'supabase') {
    const { error } = await supabase().from('manufacturers').update({ categories: manufacturer.categories }).eq('slug', manufacturer.slug)
    if (error) throw new Error(error.message)
  } else {
    saveLocal(catalog)
  }
  return category
}

export async function deleteCategory(brand: string, name: string) {
  assertWritable()
  if (databaseMode() === 'supabase') {
    const catalog = await readSupabase()
    const manufacturer = manufacturerOrThrow(catalog, brand)
    if (catalog.products.some((product) => product.brand === brand && product.category === name)) {
      throw new Error('Najpierw usuń modele przypisane do tego typu.')
    }
    const categories = manufacturer.categories.filter((item) => item !== name)
    const { error } = await supabase().from('manufacturers').update({ categories }).eq('slug', manufacturer.slug)
    if (error) throw new Error(error.message)
    return
  }
  const catalog = loadLocal()
  const manufacturer = manufacturerOrThrow(catalog, brand)
  if (catalog.products.some((product) => product.brand === brand && product.category === name)) {
    throw new Error('Najpierw usuń modele przypisane do tego typu.')
  }
  manufacturer.categories = manufacturer.categories.filter((item) => item !== name)
  saveLocal(catalog)
}

function validateProduct(catalog: Catalog, input: ProductInput) {
  const manufacturer = manufacturerOrThrow(catalog, input.brand)
  requireCategory(manufacturer, input.category)
}

async function storeBuffer(folder: string, id: string, buffer: Buffer, contentType: string, extension: string) {
  assertWritable()
  if (databaseMode() === 'supabase') {
    const objectPath = `${folder}/${id}${extension}`
    const { error } = await supabase().storage.from('media').upload(objectPath, new Uint8Array(buffer), { contentType, upsert: true })
    if (error) throw new Error(databaseError(`Nie udało się zapisać pliku: ${error.message}`))
    const { data } = supabase().storage.from('media').getPublicUrl(objectPath)
    return `${data.publicUrl}?v=${Date.now()}`
  }
  const filename = `${id}${extension}`
  const directory = path.join(process.cwd(), 'public', 'uploads')
  fs.mkdirSync(directory, { recursive: true })
  fs.writeFileSync(path.join(directory, filename), buffer)
  return `/uploads/${filename}?v=${Date.now()}`
}

async function storeProductImage(productId: string, file: UploadedImage) {
  const buffer = await normalizeProductImage(file.buffer, file.filename)
  return storeBuffer('products', `${productId}-${randomUUID()}`, buffer, 'image/webp', '.webp')
}

async function storeProductFile(productId: string, file: UploadedImage) {
  const extension = `.${fileExtension(file.filename)}`
  const url = await storeBuffer('files', `${productId}-${randomUUID()}`, file.buffer, contentTypeFor(file.filename, file.contentType), extension)
  return { url, name: path.basename(file.filename).slice(0, 120) }
}

async function collectMedia(productId: string, input: ProductInput, images: string[], files: ProductFile[]) {
  for (const file of input.images) {
    if (!isRasterImage(file.filename, file.contentType)) {
      throw new Error(`„${file.filename}” dodaj w polu Pliki. W zdjęciach zostaw JPG, PNG, WEBP, AVIF i podobne.`)
    }
    images.push(await storeProductImage(productId, file))
  }
  for (const file of input.files) {
    if (isRasterImage(file.filename, file.contentType)) images.push(await storeProductImage(productId, file))
    else files.push(await storeProductFile(productId, file))
  }
}

function productRecord(id: string, input: ProductInput, images: string[], files: ProductFile[], createdAt: string) {
  return normalizeProduct({
    id,
    brand: input.brand,
    model: input.model,
    category: input.category,
    price: input.price,
    description: input.description,
    features: input.features,
    energyClass: input.energyClass,
    image: images[0] ?? null,
    images,
    files,
    createdAt,
  })
}

export async function addProduct(input: ProductInput) {
  assertWritable()
  const catalog = databaseMode() === 'supabase' ? await readSupabase() : loadLocal()
  validateProduct(catalog, input)
  const id = randomUUID()
  const createdAt = new Date().toISOString()
  const images: string[] = []
  const files: ProductFile[] = []
  try {
    await collectMedia(id, input, images, files)
    const product = productRecord(id, input, images, files, createdAt)
    if (databaseMode() === 'supabase') {
      const { error } = await supabase().from('products').insert({
        id,
        brand: product.brand,
        model: product.model,
        category: product.category,
        price: product.price,
        description: product.description,
        features: product.features,
        energy_class: product.energyClass,
        image_url: product.image,
        images: product.images,
        files: product.files,
        created_at: createdAt,
      })
      if (error) throw new Error(databaseError(error.message))
    } else {
      catalog.products.push(product)
      saveLocal(catalog)
    }
  } catch (error) {
    await Promise.all([...images, ...files.map((file) => file.url)].map((url) => discardImage(url)))
    throw error
  }
  return id
}

async function saveProduct(current: Product, input: ProductInput) {
  const kept = current.images.filter((url) => !input.removeImages.includes(url))
  const rank = new Map(input.imageOrder.map((url, index) => [url, index]))
  const images = [...kept].sort((a, b) => (rank.get(a) ?? 9999) - (rank.get(b) ?? 9999))
  const files = current.files.filter((file) => !input.removeFiles.includes(file.url))
  const added: string[] = []
  const imageCount = images.length
  const fileCount = files.length
  try {
    await collectMedia(current.id, input, images, files)
    added.push(...images.slice(imageCount), ...files.slice(fileCount).map((file) => file.url))
    const product = productRecord(current.id, input, images, files, current.createdAt)
    if (databaseMode() === 'supabase') {
      const { error } = await supabase().from('products').update({
        brand: product.brand,
        model: product.model,
        category: product.category,
        price: product.price,
        description: product.description,
        features: product.features,
        energy_class: product.energyClass,
        image_url: product.image,
        images: product.images,
        files: product.files,
      }).eq('id', current.id)
      if (error) throw new Error(databaseError(error.message))
    } else {
      Object.assign(current, product)
    }
    await Promise.all([...input.removeImages, ...input.removeFiles].map((url) => discardImage(url)))
  } catch (error) {
    await Promise.all(added.map((url) => discardImage(url)))
    throw error
  }
}

export async function updateProduct(id: string, input: ProductInput) {
  assertWritable()
  const catalog = databaseMode() === 'supabase' ? await readSupabase() : loadLocal()
  const current = catalog.products.find((product) => product.id === id)
  if (!current) throw new Error('Nie znaleziono produktu.')
  validateProduct(catalog, input)
  await saveProduct(current, input)
  if (databaseMode() !== 'supabase') saveLocal(catalog)
}

export async function deleteProduct(id: string) {
  assertWritable()
  const catalog = databaseMode() === 'supabase' ? await readSupabase() : loadLocal()
  const current = catalog.products.find((product) => product.id === id)
  if (!current) return
  if (databaseMode() === 'supabase') {
    const { error } = await supabase().from('products').delete().eq('id', id)
    if (error) throw new Error(databaseError(error.message))
  } else {
    catalog.products = catalog.products.filter((product) => product.id !== id)
    saveLocal(catalog)
  }
  await Promise.all([...current.images, ...current.files.map((file) => file.url)].map((url) => discardImage(url)))
}

export async function addGalleryItem(image: UploadedImage, caption: string) {
  assertWritable()
  const id = randomUUID()
  const createdAt = new Date().toISOString()
  const imageUrl = await persistGalleryImage(id, image)
  const item: GalleryItem = { id, image: imageUrl, caption, createdAt }
  if (databaseMode() === 'supabase') {
    const { error } = await supabase().from('gallery').insert({ id, image_url: imageUrl, caption, created_at: createdAt })
    if (error) throw new Error(error.message)
  } else {
    const catalog = loadLocal()
    catalog.gallery.push(item)
    saveLocal(catalog)
  }
  return item
}

export async function updateGalleryCaption(id: string, caption: string) {
  assertWritable()
  if (databaseMode() === 'supabase') {
    const { error } = await supabase().from('gallery').update({ caption }).eq('id', id)
    if (error) throw new Error(error.message)
    return
  }
  const catalog = loadLocal()
  const item = catalog.gallery.find((entry) => entry.id === id)
  if (!item) throw new Error('Nie znaleziono zdjęcia.')
  item.caption = caption
  saveLocal(catalog)
}

export async function deleteGalleryItem(id: string) {
  assertWritable()
  if (databaseMode() === 'supabase') {
    const catalog = await readSupabase()
    const item = catalog.gallery.find((entry) => entry.id === id)
    if (!item) return
    const { error } = await supabase().from('gallery').delete().eq('id', id)
    if (error) throw new Error(error.message)
    await discardImage(item.image)
    return
  }
  const catalog = loadLocal()
  const item = catalog.gallery.find((entry) => entry.id === id)
  if (!item) return
  catalog.gallery = catalog.gallery.filter((entry) => entry.id !== id)
  saveLocal(catalog)
  removeLocalImage(item.image)
}
