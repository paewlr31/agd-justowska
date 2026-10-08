'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { PanelBar } from '@/components/panel-bar'
import { ENERGY_CLASSES } from '@/lib/energy'
import { formatPrice, modelsLabel } from '@/lib/format'
import type { Catalog, Product } from '@/lib/types'

type Mode = 'local' | 'supabase'

function swapPhotos(photos: string[], from: number, to: number) {
  if (to < 0 || to >= photos.length) return photos
  const next = [...photos]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

export function PanelApp({ initial, mode }: { initial: Catalog; mode: Mode }) {
  const router = useRouter()
  const [catalog, setCatalog] = useState(initial)
  const [tab, setTab] = useState<'produkty' | 'galeria'>('produkty')
  const [brand, setBrand] = useState(initial.manufacturers[0]?.name ?? '')
  const [filter, setFilter] = useState('')
  const [query, setQuery] = useState('')
  const [formCategory, setFormCategory] = useState(initial.manufacturers[0]?.categories[0] ?? '__new__')
  const [newType, setNewType] = useState('')
  const [model, setModel] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [features, setFeatures] = useState('')
  const [energyClass, setEnergyClass] = useState('')
  const [fileKey, setFileKey] = useState(0)
  const [editing, setEditing] = useState<Product | null>(null)
  const [photoOrder, setPhotoOrder] = useState<string[]>([])
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [hosted, setHosted] = useState(false)

  useEffect(() => {
    setHosted(!['localhost', '127.0.0.1'].includes(window.location.hostname))
  }, [])

  const manufacturer = catalog.manufacturers.find((item) => item.name === brand)
  const categories = manufacturer?.categories ?? []
  const needle = query.trim().toLocaleLowerCase('pl')
  const visible = catalog.products.filter((product) => {
    if (product.brand !== brand) return false
    if (filter && product.category !== filter) return false
    if (!needle) return true
    return `${product.model} ${product.description}`.toLocaleLowerCase('pl').includes(needle)
  })

  async function request(url: string, init?: RequestInit) {
    setPending(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch(url, init)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || 'Nie udało się zapisać.')
        return null
      }
      const fresh = await fetch('/api/catalog', { cache: 'no-store' })
      if (fresh.ok) setCatalog(await fresh.json())
      return data as { category?: string; ok?: boolean }
    } catch {
      setError('Brak połączenia z panelem.')
      return null
    } finally {
      setPending(false)
    }
  }

  function changeBrand(name: string) {
    setBrand(name)
    setFilter('')
    setQuery('')
    setEditing(null)
    const next = catalog.manufacturers.find((item) => item.name === name)
    setFormCategory(next?.categories[0] ?? '__new__')
  }

  async function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    let category = formCategory
    if (formCategory === '__new__') {
      const created = await request('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, name: newType }),
      })
      if (!created?.category) return
      category = created.category
      setFormCategory(category)
      setNewType('')
    }
    const body = new FormData()
    body.set('brand', brand)
    body.set('category', category)
    body.set('model', model)
    body.set('price', price)
    body.set('description', description)
    body.set('features', features)
    body.set('energyClass', energyClass)
    const source = new FormData(event.currentTarget)
    for (const item of source.getAll('images')) body.append('images', item)
    for (const item of source.getAll('files')) body.append('files', item)
    const saved = await request('/api/products', { method: 'POST', body })
    if (!saved) return
    setModel('')
    setPrice('')
    setDescription('')
    setFeatures('')
    setEnergyClass('')
    setFileKey((value) => value + 1)
    setNotice('Dodano produkt.')
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing) return
    const form = new FormData(event.currentTarget)
    const saved = await request(`/api/products/${editing.id}`, { method: 'PATCH', body: form })
    if (!saved) return
    setEditing(null)
    setPhotoOrder([])
    setNotice('Zapisano zmiany.')
  }

  async function removeProduct(product: Product) {
    if (!window.confirm(`Usunąć ${product.model}?`)) return
    const saved = await request(`/api/products/${product.id}`, { method: 'DELETE' })
    if (!saved) return
    if (editing?.id === product.id) setEditing(null)
    setNotice('Usunięto produkt.')
  }

  async function removeType() {
    if (formCategory === '__new__') return
    if (!window.confirm(`Usunąć typ „${formCategory}”? Modele muszą być skasowane wcześniej.`)) return
    const saved = await request('/api/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand, name: formCategory }),
    })
    if (!saved) return
    setFormCategory('__new__')
    setFilter('')
    setNotice('Usunięto typ urządzenia.')
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/panel/login')
    router.refresh()
  }

  return (
    <>
      <PanelBar
        action={
          <button type="button" onClick={logout} className="text-sand">
            Wyloguj
          </button>
        }
      />
      <div className="mx-auto w-full max-w-5xl px-5 py-8">
        <p className={`rounded-2xl px-4 py-3 text-sm ${hosted && mode === 'local' ? 'bg-wine text-cream' : 'bg-paper text-muted'}`}>
          {mode === 'supabase'
            ? 'Zapis idzie do bazy Supabase. Zmiany widać od razu na stronie.'
            : hosted
              ? 'Panel na serwerze nie ma jeszcze bazy. Dodawanie nie zapisze się na stałe — podłącz Supabase według README.'
              : 'Zapis lokalny na tym komputerze. Gość w internecie zobaczy zmiany po wdrożeniu i podłączeniu Supabase.'}
        </p>
        <div className="mt-6 flex gap-2" role="tablist">
          <button type="button" className={tabButton(tab === 'produkty')} onClick={() => setTab('produkty')}>
            Produkty
          </button>
          <button type="button" className={tabButton(tab === 'galeria')} onClick={() => setTab('galeria')}>
            Galeria
          </button>
        </div>
        <p aria-live="polite" className="mt-4 min-h-5 text-sm font-medium text-wine">
          {error || notice}
        </p>

        {tab === 'produkty' ? (
          <div className="mt-2 space-y-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Producent
                <select className="field" value={brand} onChange={(event) => changeBrand(event.target.value)}>
                  {catalog.manufacturers.map((item) => (
                    <option key={item.slug} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Pokaż typ
                <select className="field" value={filter} onChange={(event) => setFilter(event.target.value)}>
                  <option value="">Wszystkie typy</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <form onSubmit={addProduct} className="rounded-3xl bg-paper p-5 md:p-7">
              <h2 className="font-serif text-3xl">Dodaj produkt</h2>
              <p className="mt-2 text-sm text-muted">Cechy wpisuj po jednej w linii. Opis może mieć kilka akapitów. Zdjęcia i pliki możesz dodać po kilka naraz.</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium">
                  Typ urządzenia
                  <select className="field" value={categories.includes(formCategory) || formCategory === '__new__' ? formCategory : '__new__'} onChange={(event) => setFormCategory(event.target.value)}>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                    <option value="__new__">Dodaj nowy typ…</option>
                  </select>
                </label>
                {formCategory === '__new__' ? (
                  <label className="text-sm font-medium">
                    Nazwa nowego typu
                    <input className="field" value={newType} onChange={(event) => setNewType(event.target.value)} required placeholder="np. Płyta indukcyjna" />
                  </label>
                ) : (
                  <div className="flex items-end">
                    <button type="button" onClick={removeType} className="text-sm font-semibold text-wine">
                      Usuń wybrany typ
                    </button>
                  </div>
                )}
                <label className="text-sm font-medium">
                  Model
                  <input className="field" value={model} onChange={(event) => setModel(event.target.value)} required />
                </label>
                <label className="text-sm font-medium">
                  Cena detaliczna (zł)
                  <input className="field" inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="6999" />
                </label>
                <label className="text-sm font-medium">
                  Klasa energetyczna
                  <select className="field" value={energyClass} onChange={(event) => setEnergyClass(event.target.value)}>
                    <option value="">Nie dotyczy</option>
                    {ENERGY_CLASSES.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium md:col-span-2">
                  Cechy, jedna w linii
                  <textarea className="field min-h-28" value={features} onChange={(event) => setFeatures(event.target.value)} placeholder={'Pieczenie, para i sous-vide\nCookSmart Touch+\nTermosonda w zestawie'} />
                </label>
                <label className="text-sm font-medium md:col-span-2">
                  Opis
                  <textarea className="field min-h-36" value={description} onChange={(event) => setDescription(event.target.value)} placeholder={'Piekarnik 9000 ProAssist z funkcją SteamPro – doskonałe rezultaty jednym naciśnięciem przycisku.\n\nZe SteamPro możesz piec, gotować na parze i gotować sous-vide.'} />
                </label>
                <label className="text-sm font-medium">
                  Zdjęcia, kilka naraz
                  <input key={`images-${fileKey}`} name="images" className="field" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/bmp,image/tiff,.avif,.heic,.tif,.tiff" />
                </label>
                <label className="text-sm font-medium">
                  Pliki: PDF i inne
                  <input key={`files-${fileKey}`} name="files" className="field" type="file" multiple />
                </label>
              </div>
              <button type="submit" disabled={pending} className="mt-5 rounded-full bg-wine px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                {pending ? 'Zapisuję…' : 'Dodaj produkt'}
              </button>
            </form>

            <section>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <h2 className="font-serif text-3xl">
                  {brand}
                  <span className="mt-1 block text-base font-sans font-medium text-muted">{visible.length === 0 ? 'Brak modeli na tej liście' : modelsLabel(visible.length)}</span>
                </h2>
                <label className="text-sm font-medium">
                  Szukaj
                  <input className="field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="model" />
                </label>
              </div>
              <ul className="mt-4 divide-y divide-sand">
                {visible.map((product) => (
                  <li key={product.id} className="py-4">
                    {editing?.id === product.id ? (
                      <form onSubmit={saveEdit} className="grid gap-3 rounded-2xl bg-paper p-4 md:grid-cols-2">
                        <input type="hidden" name="brand" value={product.brand} />
                        <label className="text-sm font-medium md:col-span-2">
                          Typ urządzenia
                          <select name="category" className="field" defaultValue={product.category}>
                            {(catalog.manufacturers.find((item) => item.name === product.brand)?.categories ?? [product.category]).map((category) => (
                              <option key={category}>{category}</option>
                            ))}
                          </select>
                        </label>
                        <label className="text-sm font-medium">
                          Model
                          <input name="model" className="field" required defaultValue={product.model} />
                        </label>
                        <label className="text-sm font-medium">
                          Cena detaliczna
                          <input name="price" className="field" defaultValue={product.price ?? ''} />
                        </label>
                        <label className="text-sm font-medium md:col-span-2">
                          Klasa energetyczna
                          <select name="energyClass" className="field" defaultValue={product.energyClass ?? ''}>
                            <option value="">Nie dotyczy</option>
                            {ENERGY_CLASSES.map((item) => (
                              <option key={item} value={item}>{item}</option>
                            ))}
                          </select>
                        </label>
                        <label className="text-sm font-medium md:col-span-2">
                          Cechy, jedna w linii
                          <textarea name="features" className="field min-h-28" defaultValue={product.features} />
                        </label>
                        <label className="text-sm font-medium md:col-span-2">
                          Opis
                          <textarea name="description" className="field min-h-36" defaultValue={product.description} />
                        </label>
                        {photoOrder.length > 0 ? (
                          <div className="md:col-span-2">
                            <p className="text-sm text-muted">Pierwsze zdjęcie jest główne. Strzałkami zmieniasz kolejność, potem kliknij Zapisz.</p>
                            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                              {photoOrder.map((image, index) => (
                                <div key={image} className="text-xs font-semibold text-wine">
                                  <input type="hidden" name="imageOrder" value={image} />
                                  <img src={image} alt="" className="aspect-[4/3] w-full rounded-xl bg-sand object-contain" />
                                  <p className="mt-1">{index === 0 ? 'Główne' : `Zdjęcie ${index + 1}`}</p>
                                  <div className="mt-1 flex gap-2">
                                    <button type="button" className="rounded-full border border-wine/20 px-2 py-1 disabled:opacity-30" disabled={index === 0} onClick={() => setPhotoOrder((current) => swapPhotos(current, index, index - 1))}>
                                      ←
                                    </button>
                                    <button type="button" className="rounded-full border border-wine/20 px-2 py-1 disabled:opacity-30" disabled={index === photoOrder.length - 1} onClick={() => setPhotoOrder((current) => swapPhotos(current, index, index + 1))}>
                                      →
                                    </button>
                                  </div>
                                  <label className="mt-1 flex items-center gap-2">
                                    <input type="checkbox" name="removeImages" value={image} /> Usuń
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        <label className="text-sm font-medium">
                          Dodaj zdjęcia
                          <input name="images" className="field" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/bmp,image/tiff,.avif,.heic,.tif,.tiff" />
                        </label>
                        <label className="text-sm font-medium">
                          Dodaj pliki
                          <input name="files" className="field" type="file" multiple />
                        </label>
                        {product.files.length > 0 ? (
                          <div className="space-y-2 md:col-span-2">
                            {product.files.map((file) => (
                              <label key={file.url} className="flex items-center gap-2 text-sm">
                                <input type="checkbox" name="removeFiles" value={file.url} />
                                Usuń {file.name}
                              </label>
                            ))}
                          </div>
                        ) : null}
                        <div className="flex gap-3 md:col-span-2">
                          <button type="submit" disabled={pending} className="rounded-full bg-wine px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                            Zapisz
                          </button>
                          <button type="button" className="text-sm font-semibold" onClick={() => setEditing(null)}>
                            Anuluj
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        {product.image ? <img src={product.image} alt="" className="h-16 w-16 rounded-lg object-cover" /> : null}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{product.model}</p>
                          <p className="text-sm text-muted">
                            {product.category} · {formatPrice(product.price)}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button type="button" className="text-sm font-semibold text-wine" onClick={() => { setEditing(product); setPhotoOrder(product.images) }}>
                            Edytuj
                          </button>
                          <button type="button" className="text-sm font-semibold text-wine" onClick={() => removeProduct(product)}>
                            Usuń
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {visible.length === 0 ? <p className="mt-4 text-sm text-muted">Brak modeli dla tego wyboru.</p> : null}
            </section>
          </div>
        ) : (
          <GalleryManager catalog={catalog} pending={pending} request={request} setNotice={setNotice} />
        )}
      </div>
    </>
  )
}

function tabButton(active: boolean) {
  return `rounded-full px-4 py-2 text-sm font-semibold ${active ? 'bg-wine text-white' : 'bg-paper text-wine-ink'}`
}

function GalleryManager({
  catalog,
  pending,
  request,
  setNotice,
}: {
  catalog: Catalog
  pending: boolean
  request: (url: string, init?: RequestInit) => Promise<{ category?: string; ok?: boolean } | null>
  setNotice: (value: string) => void
}) {
  const [caption, setCaption] = useState('')
  const [fileKey, setFileKey] = useState(0)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = new FormData(event.currentTarget)
    const saved = await request('/api/gallery', { method: 'POST', body })
    if (!saved) return
    setCaption('')
    setFileKey((value) => value + 1)
    setNotice('Dodano zdjęcie do galerii.')
  }

  return (
    <div className="mt-2 space-y-8">
      <form onSubmit={onSubmit} className="rounded-3xl bg-paper p-5 md:p-7">
        <h2 className="font-serif text-3xl">Dodaj zdjęcie</h2>
        <div className="mt-4 grid gap-4">
          <label className="text-sm font-medium">
            Plik
            <input key={fileKey} name="image" type="file" required accept="image/jpeg,image/png,image/webp" className="field" />
          </label>
          <label className="text-sm font-medium">
            Podpis (nieobowiązkowy)
            <input name="caption" value={caption} onChange={(event) => setCaption(event.target.value)} className="field" />
          </label>
        </div>
        <button type="submit" disabled={pending} className="mt-5 rounded-full bg-wine px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
          Dodaj do galerii
        </button>
      </form>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.gallery.map((item) => (
          <li key={item.id} className="rounded-2xl bg-paper p-3">
            <img src={item.image} alt={item.caption || 'Zdjęcie galerii'} className="aspect-[4/3] w-full rounded-xl object-cover" />
            <GalleryCaption itemId={item.id} initial={item.caption} request={request} setNotice={setNotice} pending={pending} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function GalleryCaption({
  itemId,
  initial,
  request,
  setNotice,
  pending,
}: {
  itemId: string
  initial: string
  request: (url: string, init?: RequestInit) => Promise<{ ok?: boolean } | null>
  setNotice: (value: string) => void
  pending: boolean
}) {
  const [caption, setCaption] = useState(initial)

  async function save() {
    const saved = await request(`/api/gallery/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption }),
    })
    if (saved) setNotice('Zapisano podpis.')
  }

  async function remove() {
    if (!window.confirm('Usunąć to zdjęcie z galerii?')) return
    const saved = await request(`/api/gallery/${itemId}`, { method: 'DELETE' })
    if (saved) setNotice('Usunięto zdjęcie.')
  }

  return (
    <div className="mt-3">
      <input className="field" value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Podpis" />
      <div className="mt-2 flex gap-3">
        <button type="button" disabled={pending} onClick={save} className="text-sm font-semibold text-wine">
          Zapisz podpis
        </button>
        <button type="button" disabled={pending} onClick={remove} className="text-sm font-semibold text-wine">
          Usuń
        </button>
      </div>
    </div>
  )
}
