import Link from 'next/link'
import type { Metadata } from 'next'
import { PageIntro } from '@/components/page-intro'
import { categoryMenus } from '@/lib/categories'
import { formatPrice } from '@/lib/format'
import { getCatalog } from '@/lib/store'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Oferta',
  description: 'Urządzenia AGD według kategorii. Ceny detaliczne, bez koszyka i płatności online.',
}

export default async function OfferPage() {
  const catalog = await getCatalog()
  const groups = categoryMenus(catalog)
  const priceById = new Map(catalog.products.map((product) => [product.id, product.price]))

  return (
    <>
      <PageIntro
        eyebrow="Oferta"
        title="Kategorie"
        text="Wybierz typ urządzenia. W środku są modele wszystkich marek. Zamówienie składasz w salonie — na stronie nie ma koszyka ani płatności."
      />
      <div className="mx-auto max-w-6xl space-y-12 px-5 py-12">
        {groups.map((group) => (
          <section key={group.name}>
            <h2 className="font-serif text-4xl">{group.name}</h2>
            <ul className="mt-4 divide-y divide-sand">
              {group.items.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      <span className="font-semibold">{item.brand}</span> {item.model}
                    </span>
                    <span className="text-sm font-semibold text-wine">{formatPrice(priceById.get(item.id) ?? null)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  )
}
