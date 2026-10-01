import type { Metadata } from 'next'
import { PageIntro } from '@/components/page-intro'
import { company } from '@/lib/company'

export const metadata: Metadata = {
  title: 'Zamówienia i zwroty',
  description: 'Jak zamówić sprzęt w AGD Justowska, jak zapłacić, dostawa oraz zwroty i reklamacje.',
}

const points = [
  {
    number: '01',
    title: 'Jak złożyć zamówienie',
    text: 'Wybierz model w zakładce Producenci i skontaktuj się z nami telefonicznie, mailowo albo przyjdź do salonu. Potwierdzimy dostępność, cenę detaliczną i termin. Na stronie nie ma koszyka — zamówienie ustalamy bezpośrednio.',
  },
  {
    number: '02',
    title: 'Jak opłacić zakup',
    text: `Po ustaleniu zamówienia płatność robisz przelewem na konto ${company.bank}: ${company.account}. W tytule podaj model i swoje nazwisko. Inny sposób płatności można uzgodnić w salonie.`,
  },
  {
    number: '03',
    title: 'Dostawa',
    text: 'Dostarczamy sprzęt na miejsce. Koszt i termin zależą od gabarytu i adresu — podajemy je przy zamówieniu. Obsługujemy Kraków i dowozimy dalej po uzgodnieniu.',
  },
  {
    number: '04',
    title: 'Zwroty i reklamacje',
    text: 'Jeśli towar ma wadę albo jest niezgodny z ustaleniami, napisz na biuro@agdjustowska.pl lub zadzwoń. Podaj model, datę zakupu i opis problemu. Pomożemy przeprowadzić reklamację. Przy zakupie na odległość przysługują też uprawnienia konsumenta wynikające z przepisów.',
  },
]

export default function OrdersPage() {
  return (
    <>
      <PageIntro eyebrow="Informacje dla kupujących" title="Zamówienia i zwroty" text="Krótko: jak zamówić, jak zapłacić, jak dowozimy i co zrobić, gdy coś jest nie tak." />
      <div className="mx-auto grid max-w-6xl gap-4 px-5 py-12 md:grid-cols-2">
        {points.map((point) => (
          <article key={point.number} className="rounded-3xl bg-paper p-7">
            <span className="font-serif text-5xl text-wine/40">{point.number}</span>
            <h2 className="mt-6 font-serif text-3xl">{point.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{point.text}</p>
          </article>
        ))}
      </div>
      <div className="mx-auto mb-4 max-w-6xl px-5">
        <div className="flex flex-col justify-between gap-4 rounded-3xl bg-wine px-7 py-8 text-cream md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sand">Masz pytanie?</p>
            <p className="mt-2 font-serif text-3xl">Zadzwoń, zanim cokolwiek zamówisz.</p>
          </div>
          <a href={`tel:${company.phones[0].tel}`} className="text-lg font-semibold">
            {company.phones[0].display}
          </a>
        </div>
      </div>
    </>
  )
}
