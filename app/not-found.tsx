import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-1 flex-col items-start justify-center px-5 py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wine">AGD Justowska</p>
      <h1 className="mt-3 font-serif text-5xl">Nie ma takiej strony.</h1>
      <Link href="/" className="mt-8 rounded-full bg-wine px-5 py-3 text-sm font-semibold text-white">
        Wróć do strony głównej
      </Link>
    </main>
  )
}
