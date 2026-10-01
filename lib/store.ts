import { randomUUID } from 'crypto'
import fs from 'fs'
import path from 'path'
import { unstable_noStore as noStore } from 'next/cache'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import seedJson from '@/data/seed.json'
import { imageExtension } from '@/lib/parse'
import type { Catalog, GalleryItem, Manufacturer, Product, ProductInput, UploadedImage } from '@/lib/types'

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

function present(catalog: Catalog): Catalog {
  const manufacturers = [...catalog.manufacturers].sort((a, b) => a.sortOrder - b.sortOrder)
  const byName = new Map(manufacturers.map((item) => [item.name, item]))
  const products = [...catalog.products].sort((a, b) => {
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
  if (fs.existsSync(dbFile)) return assertCatalog(JSON.parse(fs.readFileSync(dbFile, 'utf8')))
  const initial = structuredClone(seed)
  if (!process.env.VERCEL) {
    fs.mkdirSync(path.dirname(dbFile), { recursive: true })
    fs.writeFileSync(dbFile, JSON.stringify(initial, null, 2))
  }
  return initial
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

async function readSupabase(): Promise<Catalog> {
  const db = supabase()
  const [manufacturers, products, gallery] = await Promise.all([
    db.from('manufacturers').select('slug, name, categories, sort_order').order('sort_order'),
    db.from('products').select('id, brand, model, category, price, description, image_url, created_at'),
    db.from('gallery').select('id, image_url, caption, created_at'),
  ])
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
    products: (products.data ?? []).map((row) => ({
      id: row.id,
      brand: row.brand,
      model: row.model,
      category: row.category,
      price: asPrice(row.price),
      description: row.description ?? '',
      image: row.image_url,
      createdAt: row.created_at,
    })),
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

export async function addProduct(input: ProductInput) {
  assertWritable()
  const catalog = databaseMode() === 'supabase' ? await readSupabase() : loadLocal()
  validateProduct(catalog, input)
  const id = randomUUID()
  const createdAt = new Date().toISOString()
  const image = input.image ? await persistProductImage(id, input.image) : null
  try {
    if (databaseMode() === 'supabase') {
      const { error } = await supabase().from('products').insert({
        id,
        brand: input.brand,
        model: input.model,
        category: input.category,
        price: input.price,
        description: input.description,
        image_url: image,
        created_at: createdAt,
      })
      if (error) throw new Error(error.message)
    } else {
      catalog.products.push({ id, brand: input.brand, model: input.model, category: input.category, price: input.price, description: input.description, image, createdAt })
      saveLocal(catalog)
    }
  } catch (error) {
    await discardImage(image)
    throw error
  }
  return id
}

export async function updateProduct(id: string, input: ProductInput) {
  assertWritable()
  if (databaseMode() === 'supabase') {
    const catalog = await readSupabase()
    const current = catalog.products.find((product) => product.id === id)
    if (!current) throw new Error('Nie znaleziono produktu.')
    validateProduct(catalog, input)
    let image = current.image
    if (input.image) {
      image = await persistProductImage(id, input.image)
      if (current.image && !sameStoredFile(current.image, image)) await discardImage(current.image)
    } else if (input.removeImage) {
      await discardImage(current.image)
      image = null
    }
    const { error } = await supabase().from('products').update({
      brand: input.brand,
      model: input.model,
      category: input.category,
      price: input.price,
      description: input.description,
      image_url: image,
    }).eq('id', id)
    if (error) throw new Error(error.message)
    return
  }
  const catalog = loadLocal()
  const current = catalog.products.find((product) => product.id === id)
  if (!current) throw new Error('Nie znaleziono produktu.')
  validateProduct(catalog, input)
  if (input.image) {
    const next = writeLocalImage(id, input.image)
    if (current.image && !sameStoredFile(current.image, next)) removeLocalImage(current.image)
    current.image = next
  } else if (input.removeImage) {
    removeLocalImage(current.image)
    current.image = null
  }
  current.brand = input.brand
  current.model = input.model
  current.category = input.category
  current.price = input.price
  current.description = input.description
  saveLocal(catalog)
}

export async function deleteProduct(id: string) {
  assertWritable()
  if (databaseMode() === 'supabase') {
    const catalog = await readSupabase()
    const current = catalog.products.find((product) => product.id === id)
    if (!current) return
    const { error } = await supabase().from('products').delete().eq('id', id)
    if (error) throw new Error(error.message)
    await discardImage(current.image)
    return
  }
  const catalog = loadLocal()
  const current = catalog.products.find((product) => product.id === id)
  if (!current) return
  catalog.products = catalog.products.filter((product) => product.id !== id)
  saveLocal(catalog)
  removeLocalImage(current.image)
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
