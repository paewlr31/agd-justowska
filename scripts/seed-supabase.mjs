globalThis.WebSocket = (await import('ws')).default
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Uzupełnij SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY w pliku .env.local')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const seed = JSON.parse(fs.readFileSync(path.join(root, 'data', 'seed.json'), 'utf8'))
const force = process.argv.includes('--force')

const existing = await supabase.from('manufacturers').select('slug').limit(1)
if (existing.error) {
  console.error(existing.error.message)
  console.error('Najpierw wklej supabase/schema.sql w SQL Editorze Supabase.')
  process.exit(1)
}

if (existing.data.length > 0 && !force) {
  console.log('Baza ma już producentów. Nic nie zmieniam.')
  console.log('Aby wgrać katalog od nowa, uruchom: pnpm seed -- --force')
  process.exit(0)
}

const manufacturers = seed.manufacturers.map((item) => ({
  slug: item.slug,
  name: item.name,
  categories: item.categories,
  sort_order: item.sortOrder,
}))

let result = await supabase.from('manufacturers').upsert(manufacturers, { onConflict: 'slug' })
if (result.error) throw result.error

const products = seed.products.map((item) => ({
  id: item.id,
  brand: item.brand,
  model: item.model,
  category: item.category,
  price: item.price,
  description: item.description,
  image_url: item.image,
  created_at: item.createdAt,
}))

for (let index = 0; index < products.length; index += 80) {
  result = await supabase.from('products').upsert(products.slice(index, index + 80), { onConflict: 'id' })
  if (result.error) throw result.error
}

for (const item of seed.gallery) {
  const relative = item.image.replace(/^\//, '')
  const bytes = fs.readFileSync(path.join(root, 'public', relative))
  const objectPath = `gallery/${item.id}.jpg`
  const upload = await supabase.storage.from('media').upload(objectPath, new Uint8Array(bytes), {
    contentType: 'image/jpeg',
    upsert: true,
  })
  if (upload.error) throw upload.error
  const { data } = supabase.storage.from('media').getPublicUrl(objectPath)
  result = await supabase.from('gallery').upsert(
    { id: item.id, image_url: data.publicUrl, caption: item.caption ?? '', created_at: item.createdAt },
    { onConflict: 'id' },
  )
  if (result.error) throw result.error
}

console.log(`Gotowe: ${products.length} produktów i ${seed.gallery.length} zdjęć galerii.`)
