'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { CategoryMenu } from '@/lib/categories'
import { formatPrice } from '@/lib/format'

export function OfferCatalog({ groups, brands }: { groups: CategoryMenu[]; brands: string[] }) {
  const [brand, setBrand] = useState<string | null>(null)

  const visible = useMemo(() => {
    return groups
      .map((group) => ({
        ...group,
        items: brand ? group.items.filter((item) => item.brand === brand) : group.items,
      }))
      .filter((group) => group.items.length > 0)
  }, [groups, brand])

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="rounded-2xl bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-wine">Marka</p>
        <label className="mt-3 block text-sm font-medium md:hidden">
          Wybierz markę
          <select className="field" value={brand ?? ''} onChange={(event) => setBrand(event.target.value || null)}>
            <option value="">Wszystkie marki</option>
            {brands.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-3 hidden gap-2 md:flex md:flex-wrap">
          <button type="button" aria-pressed={brand === null} onClick={() => setBrand(null)} className={chip(brand === null)}>
            Wszystkie
          </button>
          {brands.map((name) => (
            <button key={name} type="button" aria-pressed={brand === name} onClick={() => setBrand(name)} className={chip(brand === name)}>
              {name}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 text-muted">Ta marka nie ma jeszcze modeli w katalogu.</p>
      ) : (
        <div className="mt-10 space-y-12">
          {visible.map((group) => (
            <section key={group.name}>
              <h2 className="font-serif text-4xl">{group.name}</h2>
              <ul className="mt-4 divide-y divide-sand">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <Link href={item.href} className="flex items-center gap-3 py-3 sm:gap-4">
                      {item.image ? (
                        <img src={item.image} alt="" className="size-14 shrink-0 rounded-lg bg-sand object-contain sm:size-16" />
                      ) : (
                        <span className="size-14 shrink-0 rounded-lg bg-sand sm:size-16" aria-hidden />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{item.brand}</span>
                        <span className="block truncate">{item.model}</span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-wine">{formatPrice(item.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function chip(active: boolean) {
  return `rounded-full px-4 py-2 text-sm font-semibold ${active ? 'bg-wine text-white' : 'bg-cream text-wine-ink ring-1 ring-wine/15'}`
}
