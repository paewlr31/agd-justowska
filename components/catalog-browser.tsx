'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { company } from '@/lib/company'
import { formatPrice, modelsLabel } from '@/lib/format'
import type { Catalog, Product } from '@/lib/types'

export function CatalogBrowser({ catalog }: { catalog: Catalog }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const slug = searchParams.get('marka') ?? ''
  const manufacturer = catalog.manufacturers.find((item) => item.slug === slug) ?? null
  const requestedType = searchParams.get('typ') ?? ''
  const activeType = manufacturer?.categories.includes(requestedType) ? requestedType : ''
  const needle = query.trim().toLocaleLowerCase('pl')

  function matches(product: Product) {
    if (!needle) return true
    return `${product.model} ${product.description}`.toLocaleLowerCase('pl').includes(needle)
  }

  function chooseBrand(nextSlug: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('marka', nextSlug)
    params.delete('typ')
    setQuery('')
    router.replace(`/producenci?${params}`, { scroll: false })
    document.getElementById('typy')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function chooseType(type: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (type) params.set('typ', type)
    else params.delete('typ')
    router.replace(`/producenci?${params}`, { scroll: false })
  }

  const brandProducts = manufacturer ? catalog.products.filter((product) => product.brand === manufacturer.name) : []
  const groups = (manufacturer?.categories ?? [])
    .filter((category) => (activeType ? category === activeType : true))
    .map((category) => ({
      category,
      items: brandProducts.filter((product) => product.category === category && matches(product)),
    }))
    .filter((group) => (activeType ? true : group.items.length > 0))

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-wine">1 · Producent</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {catalog.manufacturers.map((item) => {
          const count = catalog.products.filter((product) => product.brand === item.name).length
          const selected = item.slug === manufacturer?.slug
          return (
            <button
              key={item.slug}
              type="button"
              aria-pressed={selected}
              onClick={() => chooseBrand(item.slug)}
              className={`rounded-2xl border px-4 py-4 text-left transition ${selected ? 'border-wine bg-paper shadow-sm' : 'border-transparent bg-paper/70 hover:border-wine/30'}`}
            >
              <span className="block font-serif text-2xl leading-none">{item.name}</span>
              <span className="mt-2 block text-xs font-medium uppercase tracking-wider text-muted">{modelsLabel(count)}</span>
            </button>
          )
        })}
      </div>

      <div id="typy" className="scroll-mt-28 pt-12">
        {!manufacturer ? (
          <p className="text-muted">Wybierz producenta, żeby zobaczyć typy urządzeń i modele.</p>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-wine">2 · Typ urządzenia</p>
            <h2 className="mt-2 font-serif text-4xl">{manufacturer.name}</h2>
            {manufacturer.categories.length === 0 ? (
              <p className="mt-4 max-w-xl text-muted">
                Tej marki jeszcze nie ma w katalogu. Zadzwoń{' '}
                <a className="font-semibold text-wine" href={`tel:${company.phones[0].tel}`}>
                  {company.phones[0].display}
                </a>{' '}
                — dobierzemy sprzęt w salonie.
              </p>
            ) : (
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" aria-pressed={!activeType} onClick={() => chooseType('')} className={chip(!activeType)}>
                  Wszystkie
                </button>
                {manufacturer.categories.map((category) => (
                  <button key={category} type="button" aria-pressed={activeType === category} onClick={() => chooseType(category)} className={chip(activeType === category)}>
                    {category}
                  </button>
                ))}
              </div>
            )}

            {brandProducts.length > 0 ? (
              <label className="mt-6 block max-w-sm text-sm font-medium text-muted">
                Szukaj modelu
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="field" placeholder="np. numer modelu" />
              </label>
            ) : null}

            {brandProducts.length === 0 ? null : (
            <div className="mt-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-wine">3 · Modele</p>
              {groups.length === 0 ? (
                <p className="mt-4 text-muted">Brak modeli dla tego wyszukiwania.</p>
              ) : (
                groups.map((group) => (
                  <section key={group.category} className="mt-8">
                    <h3 className="font-serif text-3xl">{group.category}</h3>
                    {group.items.length === 0 ? (
                      <p className="mt-3 text-sm text-muted">W tym typie nie ma jeszcze modeli.</p>
                    ) : (
                      <ul className="mt-2">
                        {group.items.map((product) => (
                          <li key={product.id} className={`grid gap-4 border-b border-sand py-5 ${product.image ? 'sm:grid-cols-[7.5rem_1fr_auto]' : 'sm:grid-cols-[1fr_auto]'} sm:items-center`}>
                            {product.image ? <img src={product.image} alt={`${product.brand} ${product.model}`} className="h-28 w-full rounded-xl object-cover sm:w-28" /> : null}
                            <div>
                              <h4 className="font-serif text-2xl leading-tight">{product.model}</h4>
                              {product.description ? <p className="mt-1 max-w-2xl whitespace-pre-line text-sm leading-6 text-muted">{product.description}</p> : null}
                            </div>
                            <div className="sm:text-right">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Cena detaliczna</p>
                              <p className="mt-1 text-lg font-semibold text-wine">{formatPrice(product.price)}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))
              )}
            </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function chip(active: boolean) {
  return `rounded-full px-4 py-2 text-sm font-semibold ${active ? 'bg-wine text-white' : 'bg-paper text-wine-ink ring-1 ring-wine/15 hover:ring-wine/40'}`
}
