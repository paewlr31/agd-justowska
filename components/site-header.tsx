'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { company, nav } from '@/lib/company'

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-wine-deep text-cream">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-3" aria-label="AGD Justowska, strona główna">
          <img src="/logo.png" alt="" className="h-14 w-14 object-contain" />
          <span className="hidden leading-tight sm:block">
            <span className="block font-serif text-2xl tracking-tight">AGD Justowska</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-sand">Kraków</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Główna nawigacja">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? 'page' : undefined}
              className={`text-[13px] font-semibold ${isActive(pathname, item.href) ? 'text-white underline decoration-sand decoration-2 underline-offset-8' : 'text-cream/75 hover:text-white'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <a href={`tel:${company.phones[0].tel}`} className="hidden text-sm font-semibold text-sand xl:inline">
          {company.phones[0].display}
        </a>
        <button
          type="button"
          className="shrink-0 rounded-full border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-wider lg:hidden"
          aria-expanded={open}
          aria-controls="menu-mobilne"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'Zamknij' : 'Menu'}
        </button>
      </div>
      {open ? (
        <nav id="menu-mobilne" className="flex flex-col gap-1 border-t border-white/10 px-5 py-4 lg:hidden" aria-label="Menu mobilne">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-xl px-2 py-3 text-base font-semibold" aria-current={isActive(pathname, item.href) ? 'page' : undefined}>
              {item.label}
            </Link>
          ))}
          <a href={`tel:${company.phones[0].tel}`} className="rounded-xl px-2 py-3 text-base font-semibold text-sand">
            {company.phones[0].display}
          </a>
        </nav>
      ) : null}
    </header>
  )
}
