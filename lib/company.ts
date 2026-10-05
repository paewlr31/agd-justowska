export const company = {
  name: 'AGD Justowska',
  legalName: 'Forma High',
  founder: 'Piotr Pawlik',
  street: 'ul. Królowej Jadwigi 306 lokal 2',
  postalCode: '30-218',
  city: 'Kraków',
  email: 'biuro@agdjustowska.pl',
  phones: [
    { display: '+48 604 545 585', tel: '+48604545585' },
    { display: '+48 530 093 675', tel: '+48530093675' },
  ],
  nip: '678 13 85 385',
  regon: '545 16 1793',
  bank: 'ING Bank',
  account: '34 1050 1445 1000 0090 8717 2251',
  mapQuery: 'ul. Królowej Jadwigi 306, 30-218 Kraków',
}

export const nav = [
  { href: '/', label: 'O firmie' },
  { href: '/producenci', label: 'Oferta' },
  { href: '/galeria', label: 'Galeria' },
  { href: '/kontakt', label: 'Kontakt' },
  { href: '/zamowienia', label: 'Zamówienia i zwroty' },
] as const
