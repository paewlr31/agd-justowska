'use client'

import { MessageCircle } from 'lucide-react'
import { useState, type MouseEvent } from 'react'
import { ContactForm } from '@/components/contact-form'

export function FloatingContact({ accessKey }: { accessKey: string }) {
  const [open, setOpen] = useState(false)

  function closeIfIdle(event: MouseEvent<HTMLDivElement>) {
    const next = event.relatedTarget
    if (next instanceof Node && event.currentTarget.contains(next)) return
    if (event.currentTarget.contains(document.activeElement)) return
    setOpen(false)
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end" onMouseEnter={() => setOpen(true)} onMouseLeave={closeIfIdle}>
      {open ? (
        <div className="mb-3 max-h-[min(32rem,calc(100vh-6rem))] w-[min(22rem,calc(100vw-2.5rem))] overflow-y-auto rounded-2xl border border-wine/15 bg-white p-5 text-wine-ink shadow-xl">
          <ContactForm accessKey={accessKey} compact />
        </div>
      ) : null}
      <button
        type="button"
        className="flex size-14 items-center justify-center rounded-full bg-wine text-white shadow-lg"
        aria-expanded={open}
        aria-label={open ? 'Zamknij formularz' : 'Otwórz formularz'}
        onClick={() => setOpen((value) => !value)}
      >
        <MessageCircle className="size-6" />
      </button>
    </div>
  )
}
