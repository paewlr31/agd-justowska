import type { Metadata } from 'next'
import { OfferCatalog } from '@/components/offer-catalog'
import { PageIntro } from '@/components/page-intro'
import { categoryMenus } from '@/lib/categories'
import { getCatalog } from '@/lib/store'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Oferta',
  description: 'Urządzenia AGD według kategorii i marki. Ceny detaliczne, bez koszyka i płatności online.',
}

export default async function OfferPage() {
  const catalog = await getCatalog()

  return (
    <>
      <PageIntro
        eyebrow="Oferta"
        title="Kategorie"
        text="Domyślnie modele są ułożone według typu urządzenia. U góry możesz zawęzić listę do jednej marki."
      />
      <OfferCatalog groups={categoryMenus(catalog)} brands={catalog.manufacturers.map((item) => item.name)} />
    </>
  )
}
