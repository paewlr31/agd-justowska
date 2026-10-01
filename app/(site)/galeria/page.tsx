import type { Metadata } from 'next'
import { GalleryView } from '@/components/gallery-view'
import { PageIntro } from '@/components/page-intro'
import { getCatalog } from '@/lib/store'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Galeria',
  description: 'Nasze wykonanie — autorskie zdjęcia salonu AGD Justowska.',
}

export default async function GalleryPage() {
  const catalog = await getCatalog()
  return (
    <>
      <PageIntro eyebrow="Galeria" title="Nasze wykonanie" text="Autorskie zdjęcia z salonu i realizacji. Nowe kadry dodajemy na bieżąco." />
      <GalleryView items={catalog.gallery} />
    </>
  )
}
