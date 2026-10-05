'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PhoneLink } from '@/components/contact-links'
import type { CategoryMenu } from '@/lib/categories'
import { company, nav } from '@/lib/company'

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SiteHeader({ groups }: { groups: CategoryMenu[] }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<{ name: string; alignEnd: boolean } | null>(null)

  useEffect(() => {
    setOpen(false)
    setCategory(null)
  }, [pathname])

  function openCategory(name: string, element: HTMLElement) {
    const rect = element.getBoundingClientRect()
    setCategory({ name, alignEnd: rect.left + 288 > window.innerWidth })
  }

  return (
    <header className="sticky top-0 z-40 bg-wine-deep text-cream">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4">
        <Link href="/" className="flex items-center gap-4" aria-label="AGD Justowska, strona główna">
          <span className="flex size-20 items-center justify-center rounded-2xl bg-white p-1.5 md:size-24">
            <img src="/logo.png" alt="" className="size-full object-contain" />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block font-serif text-3xl tracking-tight">AGD Justowska</span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-sand">Kraków</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Główna nawigacja">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? 'page' : undefined}
              className={`text-base font-semibold ${isActive(pathname, item.href) ? 'text-white underline decoration-sand decoration-2 underline-offset-8' : 'text-cream/80 hover:text-white'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <PhoneLink phone={company.phones[0]} className="hidden text-sm font-semibold text-sand xl:inline-flex" />
        <button
          type="button"
          className="shrink-0 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold uppercase tracking-wider lg:hidden"
          aria-expanded={open}
          aria-controls="menu-mobilne"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'Zamknij' : 'Menu'}
        </button>
      </div>

      <nav className="relative z-40 hidden border-t border-white/10 lg:block" aria-label="Kategorie produktów">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-1 px-4 py-2">
          {groups.map((group) => (
            <div key={group.name} className="relative" onMouseLeave={() => setCategory((current) => (current?.name === group.name ? null : current))}>
              <button
                type="button"
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${category?.name === group.name ? 'bg-white text-wine-deep' : 'text-cream hover:bg-white/10'}`}
                aria-expanded={category?.name === group.name}
                onMouseEnter={(event) => openCategory(group.name, event.currentTarget)}
                onClick={(event) => {
                  if (category?.name === group.name) setCategory(null)
                  else openCategory(group.name, event.currentTarget)
                }}
              >
                {group.name}
              </button>
              {category?.name === group.name ? (
                <div className={`absolute top-full z-50 pt-1 ${category.alignEnd ? 'right-0' : 'left-0'}`}>
                  <div className="max-h-80 w-72 overflow-y-auto rounded-xl bg-white py-2 text-wine-ink shadow-xl">
                    {group.items.map((item) => (
                      <Link key={item.id} href={item.href} className="block px-4 py-2 text-sm hover:bg-cream" onClick={() => setCategory(null)}>
                        <span className="font-semibold">{item.brand}</span> {item.model}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </nav>

      {open ? (
        <nav id="menu-mobilne" className="max-h-[70vh] overflow-y-auto border-t border-white/10 px-5 py-4 lg:hidden" aria-label="Menu mobilne">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-xl px-2 py-3 text-base font-semibold" aria-current={isActive(pathname, item.href) ? 'page' : undefined}>
              {item.label}
            </Link>
          ))}
          <div className="px-2 py-3">
            <PhoneLink phone={company.phones[0]} className="font-semibold text-sand" />
          </div>
          <div className="mt-2 border-t border-white/10 pt-2">
            {groups.map((group) => (
              <details key={group.name} className="border-b border-white/10">
                <summary className="cursor-pointer px-2 py-3 text-sm font-semibold">{group.name}</summary>
                <div className="pb-3 pl-4">
                  {group.items.map((item) => (
                    <Link key={item.id} href={item.href} className="block py-1.5 text-sm text-cream/80">
                      {item.brand} {item.model}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  )
}
