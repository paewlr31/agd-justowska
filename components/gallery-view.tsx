'use client'

import { useEffect, useState } from 'react'
import type { GalleryItem } from '@/lib/types'

export function GalleryView({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState<number | null>(null)

  useEffect(() => {
    if (index == null) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setIndex(null)
      if (event.key === 'ArrowRight') setIndex((current) => (current == null ? current : (current + 1) % items.length))
      if (event.key === 'ArrowLeft') setIndex((current) => (current == null ? current : (current - 1 + items.length) % items.length))
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [index, items.length])

  if (items.length === 0) {
    return <p className="mx-auto max-w-6xl px-5 py-16 text-muted">Zdjęcia realizacji pojawią się tutaj po dodaniu ich w panelu.</p>
  }

  const current = index == null ? null : items[index]

  return (
    <>
      <div className="mx-auto max-w-6xl columns-1 gap-4 px-5 py-12 sm:columns-2 lg:columns-3">
        {items.map((item, itemIndex) => (
          <figure key={item.id} className="mb-4 break-inside-avoid">
            <button type="button" className="block w-full overflow-hidden rounded-2xl bg-sand" onClick={() => setIndex(itemIndex)}>
              <img src={item.image} alt={item.caption || `Realizacja AGD Justowska ${itemIndex + 1}`} className="w-full" loading="lazy" />
            </button>
            {item.caption ? <figcaption className="px-1 pt-2 text-sm text-muted">{item.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
      {current ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-wine-ink/90 p-4" role="dialog" aria-modal="true" aria-label="Podgląd zdjęcia">
          <button type="button" className="absolute right-4 top-4 rounded-full bg-cream px-4 py-2 text-sm font-semibold text-wine-ink" onClick={() => setIndex(null)}>
            Zamknij
          </button>
          <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-cream/90 px-3 py-2 text-sm font-semibold md:left-6" onClick={() => setIndex((index! - 1 + items.length) % items.length)} aria-label="Poprzednie zdjęcie">
            ←
          </button>
          <img src={current.image} alt={current.caption || 'Realizacja AGD Justowska'} className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain" />
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-cream/90 px-3 py-2 text-sm font-semibold md:right-6" onClick={() => setIndex((index! + 1) % items.length)} aria-label="Następne zdjęcie">
            →
          </button>
        </div>
      ) : null}
    </>
  )
}
