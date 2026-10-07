import { FloatingContact } from '@/components/floating-contact'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { categoryMenus } from '@/lib/categories'
import { company } from '@/lib/company'
import { getCatalog } from '@/lib/store'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const groups = categoryMenus(await getCatalog())
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: company.name,
    email: company.email,
    telephone: company.phones.map((phone) => phone.tel),
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.street,
      postalCode: company.postalCode,
      addressLocality: company.city,
      addressCountry: 'PL',
    },
  }

  return (
    <div className="flex flex-1 flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <a href="#tresc" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-cream focus:px-4 focus:py-2">
        Przejdź do treści
      </a>
      <SiteHeader groups={groups} />
      <main id="tresc" className="flex-1 pb-28">
        {children}
      </main>
      <SiteFooter />
      <FloatingContact accessKey={process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? ''} />
    </div>
  )
}
