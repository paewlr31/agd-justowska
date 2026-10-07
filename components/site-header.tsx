'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { PhoneLink } from '@/components/contact-links'
import { departments, type CategoryMenu } from '@/lib/categories'
import { company, nav } from '@/lib/company'

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SiteHeader({ groups }: { groups: CategoryMenu[] }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [offerOpen, setOfferOpen] = useState(false)
  const [categoryName, setCategoryName] = useState<string | null>(null)
  const closeTimer = useRef<number | null>(null)
  const sections = departments(groups)
  const activeGroup = groups.find((group) => group.name === categoryName) ?? null

  useEffect(() => {
    setOpen(false)
    setOfferOpen(false)
    setCategoryName(null)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  function cancelClose() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
  }

  function scheduleClose() {
    cancelClose()
    closeTimer.current = window.setTimeout(() => {
      setOfferOpen(false)
      setCategoryName(null)
    }, 160)
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
            <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-sand">Salon marki Forma High</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Główna nawigacja">
          {nav.map((item) =>
            item.href === '/producenci' ? (
              <div key={item.href} className="relative" onMouseEnter={() => { cancelClose(); setOfferOpen(true) }} onMouseLeave={scheduleClose}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                  aria-expanded={offerOpen}
                  className={`text-base font-semibold ${isActive(pathname, item.href) ? 'text-white underline decoration-sand decoration-2 underline-offset-8' : 'text-cream/80 hover:text-white'}`}
                >
                  {item.label}
                </Link>
                {offerOpen ? (
                  <div className="absolute left-0 top-full z-50 flex pt-3" onMouseEnter={cancelClose}>
                    <div className="max-h-[70vh] w-72 overflow-y-auto rounded-l-2xl bg-white py-3 text-wine-ink shadow-xl">
                      {sections.map((section) => (
                        <div key={section.name} className="px-3 pb-3">
                          <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-wine">{section.name}</p>
                          {section.groups.map((group) => (
                            <button
                              key={group.name}
                              type="button"
                              className={`block w-full rounded-lg px-2 py-1.5 text-left text-sm font-semibold ${categoryName === group.name ? 'bg-cream text-wine' : 'hover:bg-cream'}`}
                              onMouseEnter={() => setCategoryName(group.name)}
                              onClick={() => setCategoryName(group.name)}
                            >
                              {group.name}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                    {activeGroup ? (
                      <div className="max-h-[70vh] w-80 overflow-y-auto rounded-r-2xl border-l border-sand bg-[#fffaf7] py-2 text-wine-ink shadow-xl">
                        {activeGroup.items.map((item) => (
                          <Link key={item.id} href={item.href} className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-cream" onClick={() => setOfferOpen(false)}>
                            {item.image ? <img src={item.image} alt="" className="size-10 shrink-0 rounded-md bg-sand object-contain" /> : <span className="size-10 shrink-0 rounded-md bg-sand" aria-hidden />}
                            <span>
                              <span className="font-semibold">{item.brand}</span> {item.model}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                className={`text-base font-semibold ${isActive(pathname, item.href) ? 'text-white underline decoration-sand decoration-2 underline-offset-8' : 'text-cream/80 hover:text-white'}`}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <PhoneLink phone={company.phones[0]} className="hidden text-sm font-semibold text-sand xl:inline-flex" />
        <button
          type="button"
          className="shrink-0 rounded-full border border-white/30 bg-wine-deep px-4 py-2 text-sm font-semibold uppercase tracking-wider lg:hidden"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'Zamknij' : 'Menu'}
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[70] flex flex-col bg-wine-deep text-cream lg:hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <p className="font-serif text-2xl">Menu</p>
            <button type="button" className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold" onClick={() => setOpen(false)}>
              Zamknij
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-5 pb-10" aria-label="Menu mobilne">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="block border-b border-white/10 py-4 text-lg font-semibold">
                {item.label}
              </Link>
            ))}
            <div className="py-4">
              <PhoneLink phone={company.phones[0]} className="font-semibold text-sand" />
            </div>
            {sections.map((section) => (
              <details key={section.name} className="border-t border-white/10">
                <summary className="cursor-pointer py-4 text-base font-semibold">{section.name}</summary>
                {section.groups.map((group) => (
                  <details key={group.name} className="pb-2 pl-3">
                    <summary className="cursor-pointer py-2 text-sm font-semibold text-sand">{group.name}</summary>
                    <div className="pb-2 pl-3">
                      {group.items.map((item) => (
                        <Link key={item.id} href={item.href} className="block py-1.5 text-sm text-cream/85">
                          {item.brand} {item.model}
                        </Link>
                      ))}
                    </div>
                  </details>
                ))}
              </details>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
