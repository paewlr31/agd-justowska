import type { Metadata } from 'next'
import { MailLink, PhoneLink } from '@/components/contact-links'
import { ContactForm } from '@/components/contact-form'
import { CopyAccount } from '@/components/copy-account'
import { PageIntro } from '@/components/page-intro'
import { company } from '@/lib/company'

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'AGD Justowska, ul. Królowej Jadwigi 306 lokal 2, 30-218 Kraków. Telefon, e-mail i formularz.',
}

export default function ContactPage() {
  const map = `https://maps.google.com/maps?q=${encodeURIComponent(company.mapQuery)}&hl=pl&z=16&output=embed`
  const external = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.mapQuery)}`

  return (
    <>
      <PageIntro eyebrow="Kontakt" title="Jesteśmy w Krakowie." text="Salon, telefony i formularz. Tutaj umawiamy rozmowę, dostawę i zamówienie." />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6 text-sm leading-7 text-muted">
          <div>
            <h2 className="font-serif text-3xl text-wine-ink">{company.name}</h2>
            <p className="mt-2">
              {company.street}
              <br />
              {company.postalCode} {company.city}
            </p>
          </div>
          <div>
            {company.phones.map((phone) => (
              <p key={phone.tel}>
                <PhoneLink phone={phone} className="font-semibold text-wine" />
              </p>
            ))}
            <p>
              <MailLink className="font-semibold text-wine" />
            </p>
          </div>
          <div>
            <p className="font-semibold text-wine-ink">Godziny otwarcia:</p>
            <p>Pon-Pt: 10-18</p>
            <p>Sb 9-13</p>
          </div>
          <div>
            <p>NIP {company.nip}</p>
            <p>REGON {company.regon}</p>
            <p className="mt-3 font-semibold text-wine-ink">{company.bank}</p>
            <p className="select-all text-base text-wine-ink">{company.account}</p>
            <CopyAccount value={company.account} />
          </div>
          <div className="overflow-hidden rounded-2xl bg-sand">
            <iframe title="Mapa dojazdu: ul. Królowej Jadwigi 306, Kraków" src={map} className="h-72 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
          <a href={external} target="_blank" rel="noreferrer" className="inline-block font-semibold text-wine">
            Otwórz w Google Maps
          </a>
        </div>
        <ContactForm accessKey={process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? ''} />
      </div>
    </>
  )
}
