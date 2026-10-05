import Link from 'next/link'
import { brandLogos } from '@/lib/brands'
import { MailLink, PhoneLink } from '@/components/contact-links'
import { company, nav } from '@/lib/company'

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-wine-ink text-cream">
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 px-5 py-6">
          {brandLogos.map((logo) => (
            <div key={logo.name} className="flex h-12 w-28 items-center justify-center rounded-md bg-white px-2">
              <img src={logo.src} alt={logo.name} className="max-h-8 max-w-full object-contain" />
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-3">
        <div>
          <p className="font-serif text-3xl">AGD Justowska</p>
          <p className="mt-3 text-sm leading-6 text-cream/75">
            {company.legalName}. Salon w Krakowie. Doradztwo, dostawa i sprzęt dobierany z przekonaniem.
          </p>
        </div>
        <div className="text-sm leading-7 text-cream/80">
          <p>{company.street}</p>
          <p>
            {company.postalCode} {company.city}
          </p>
          {company.phones.map((phone) => (
            <p key={phone.tel}>
              <PhoneLink phone={phone} className="hover:text-white" />
            </p>
          ))}
          <p>
            <MailLink className="hover:text-white" />
          </p>
        </div>
        <div className="text-sm leading-7 text-cream/80">
          <p>NIP {company.nip}</p>
          <p>REGON {company.regon}</p>
          <p className="mt-2">
            {company.bank}
            <br />
            <span className="select-all">{company.account}</span>
          </p>
          <nav className="mt-4 flex flex-col" aria-label="Stopka">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-4 text-center text-xs text-cream/60">© 2026 AGD Justowska · {company.legalName}</div>
    </footer>
  )
}
