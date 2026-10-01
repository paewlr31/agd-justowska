import { Suspense } from 'react'
import type { Metadata } from 'next'
import { CatalogBrowser } from '@/components/catalog-browser'
import { PageIntro } from '@/components/page-intro'
import { getCatalog } from '@/lib/store'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Producenci',
  description: 'Katalog marek i modeli AGD Justowska. Ceny detaliczne, bez koszyka i płatności online.',
}

export default async function ProducersPage() {
  const catalog = await getCatalog()
  return (
    <>
      <PageIntro
        eyebrow="Oferta"
        title="Producenci"
        text="Wybierz markę, a potem typ urządzenia. Podajemy cenę detaliczną. Zamówienie składasz w salonie — na stronie nie ma koszyka ani płatności."
      />
      <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-12 text-muted">Wczytuję katalog…</p>}>
        <CatalogBrowser catalog={catalog} />
      </Suspense>
    </>
  )
}
