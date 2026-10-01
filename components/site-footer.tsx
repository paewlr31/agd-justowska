import Link from 'next/link'
import { company, nav } from '@/lib/company'

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-wine-ink text-cream">
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
              <a className="hover:text-white" href={`tel:${phone.tel}`}>
                {phone.display}
              </a>
            </p>
          ))}
          <p>
            <a className="hover:text-white" href={`mailto:${company.email}`}>
              {company.email}
            </a>
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
