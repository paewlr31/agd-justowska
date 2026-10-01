import Link from 'next/link'

export function PanelBar({ action }: { action?: React.ReactNode }) {
  return (
    <header className="border-b border-white/10 bg-wine-deep text-cream">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sand">Adres tylko dla właściciela</p>
          <p className="font-serif text-2xl">Panel właściciela</p>
        </div>
        <div className="flex items-center gap-4 text-sm font-semibold">
          <Link href="/" className="text-sand">
            Strona
          </Link>
          {action}
        </div>
      </div>
    </header>
  )
}
