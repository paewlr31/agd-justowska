'use client'

import { useState } from 'react'

export function ProductGallery({ images, label }: { images: string[]; label: string }) {
  const [active, setActive] = useState(0)
  const current = images[active] ?? null
  if (!current) {
    return <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-sand text-sm text-muted">Brak zdjęć</div>
  }

  return (
    <div>
      <img src={current} alt={label} className="aspect-[4/3] w-full rounded-3xl bg-sand object-contain" />
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button key={image} type="button" onClick={() => setActive(index)} className={`overflow-hidden rounded-xl ${index === active ? 'ring-2 ring-wine' : ''}`} aria-label={`Zdjęcie ${index + 1}`}>
              <img src={image} alt="" className="aspect-[4/3] w-full bg-sand object-contain" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
