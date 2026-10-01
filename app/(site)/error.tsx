'use client'

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="font-serif text-4xl">Nie udało się wczytać tej strony.</h1>
      <button type="button" onClick={reset} className="mt-6 rounded-full bg-wine px-5 py-3 text-sm font-semibold text-white">
        Spróbuj ponownie
      </button>
    </div>
  )
}
