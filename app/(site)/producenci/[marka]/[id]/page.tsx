import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductGallery } from '@/components/product-gallery'
import { formatPrice } from '@/lib/format'
import { getCatalog } from '@/lib/store'

export const dynamic = 'force-dynamic'

type Params = { marka: string; id: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params
  const catalog = await getCatalog()
  const product = catalog.products.find((item) => item.id === id)
  if (!product) return { title: 'Produkt' }
  return { title: `${product.brand} ${product.model}`, description: product.description || `${product.brand} ${product.model}` }
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { marka, id } = await params
  const catalog = await getCatalog()
  const product = catalog.products.find((item) => item.id === id)
  const manufacturer = catalog.manufacturers.find((item) => item.slug === marka)
  if (!product || !manufacturer || manufacturer.name !== product.brand) notFound()

  const features = product.features.split('\n').map((line) => line.trim()).filter(Boolean)
  const paragraphs = product.description.split(/\n{2,}|\n/).map((line) => line.trim()).filter(Boolean)

  return (
    <article className="mx-auto max-w-6xl px-5 py-10">
      <p className="text-sm text-muted">
        <Link href="/producenci" className="font-semibold text-wine">Producenci</Link>
        <span> / </span>
        <Link href={`/producenci?marka=${manufacturer.slug}`} className="font-semibold text-wine">{product.brand}</Link>
      </p>
      <div className="mt-6 grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="lg:sticky lg:top-52">
          <ProductGallery images={product.images} label={`${product.brand} ${product.model}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-wine">{product.category}</p>
          <h1 className="mt-2 font-serif text-5xl leading-none">{product.model}</h1>
          <p className="mt-3 text-lg text-muted">{product.brand}</p>
          <div className="mt-6 flex flex-wrap items-end gap-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Cena detaliczna</p>
              <p className="mt-1 text-2xl font-semibold text-wine">{formatPrice(product.price)}</p>
            </div>
            {product.energyClass ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Klasa energetyczna</p>
                <p className="mt-1 inline-flex rounded-full bg-wine px-4 py-1 text-lg font-semibold text-white">{product.energyClass}</p>
              </div>
            ) : null}
          </div>

          {features.length > 0 ? (
            <section className="mt-10">
              <h2 className="font-serif text-3xl">Cechy</h2>
              <ul className="mt-4 space-y-2 text-base leading-7 text-muted">
                {features.map((feature) => (
                  <li key={feature} className="border-b border-sand py-2">{feature}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {paragraphs.length > 0 ? (
            <section className="mt-10">
              <h2 className="font-serif text-3xl">Opis</h2>
              <div className="mt-4 space-y-4 text-base leading-7 text-muted">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ) : null}

          {product.files.length > 0 ? (
            <section className="mt-10">
              <h2 className="font-serif text-3xl">Pliki</h2>
              <ul className="mt-4 space-y-2">
                {product.files.map((file) => (
                  <li key={file.url}>
                    <a href={file.url} className="font-semibold text-wine" download={file.name}>
                      {file.name}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  )
}
