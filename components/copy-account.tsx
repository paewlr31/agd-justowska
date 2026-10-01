'use client'

import { useState } from 'react'

export function CopyAccount({ value }: { value: string }) {
  const [done, setDone] = useState(false)

  return (
    <button
      type="button"
      className="mt-2 rounded-full border border-wine/20 px-3 py-1.5 text-xs font-semibold text-wine"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value.replace(/\s/g, ''))
          setDone(true)
          window.setTimeout(() => setDone(false), 2000)
        } catch {
          setDone(false)
        }
      }}
    >
      {done ? 'Skopiowano' : 'Kopiuj numer konta'}
    </button>
  )
}
