import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'O firmie',
  description: 'Forma High i salon AGD Justowska w Krakowie. Piotr Pawlik, 27 lat w branży AGD.',
}

const paragraphs = [
  'Firma Forma High powstała w 2026 roku. Założycielem jest Piotr Pawlik, który pracuje w branży AGD od 27 lat. To doświadczenie jest największym kapitałem firmy.',
  'Praca u dużego producenta AGD dała wiedzę o urządzeniach i o tym, jak działa cała branża. Dała też praktyczne rozeznanie w użytkowaniu sprzętu w domu. Współpraca z kontrahentami pokazała mocne i słabe strony marek, które produkują urządzenia do użytku domowego.',
  'Moją mocną stroną jest wiedza o tym, co aktualnie jest najlepsze na rynku AGD. Nie polecam niczego, do czego nie mam przekonania, i nie proponuję sprzętu, którego nie mogę z czystym sumieniem polecić.',
  'Naszą główną propozycją jest sprzęt AGD, a także technika kuchenna: zlewozmywaki i baterie, bez których kuchnia nie jest kompletna.',
  'W salonie mamy również blaty ze spieków, konglomeratów i kamienia naturalnego. W portfolio są firmy produkujące meble do mieszkań i domów oraz wykonawcy, których możemy polecić do wykończenia mieszkania lub domu — od stanu deweloperskiego do stanu, w którym można zamieszkać.',
  'Doradzamy i proponujemy rozwiązania dopasowane do potrzeb każdego klienta. Dostarczamy na miejsce. Jesteśmy elastyczni i oferujemy konkurencyjne ceny.',
]

const offers = [
  { title: 'Sprzęt AGD', text: 'Piekarniki, płyty, lodówki, zmywarki, pralki i ekspresy marek, które znamy z praktyki.' },
  { title: 'Technika kuchenna', text: 'Zlewozmywaki i baterie, które domykają projekt kuchni.' },
  { title: 'Blaty', text: 'Spieki, konglomeraty i kamień naturalny.' },
  { title: 'Meble i wykończenie', text: 'Polecamy sprawdzone firmy meblowe i wykonawców wykończenia pod klucz.' },
]

function QuoteBand({ children }: { children: string }) {
  return (
    <section className="bg-white">
      <p className="mx-auto max-w-4xl px-5 py-8 text-center font-serif text-2xl italic leading-snug text-wine-ink md:text-3xl">„{children}”</p>
    </section>
  )
}

export default function AboutPage() {
  return (
    <>
      <section className="bg-wine-deep text-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:py-20">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sand">Kraków · Forma High</p>
            <h1 className="mt-4 font-serif text-5xl leading-[0.95] md:text-7xl">Sprzęt, za którym stoimy.</h1>
            <p className="mt-6 max-w-xl font-serif text-2xl italic leading-snug text-sand md:text-3xl">
              „Nie proponuję sprzętu, którego nie mogę z czystym sumieniem polecić.”
            </p>
            <p className="mt-4 text-sm text-cream/75">Piotr Pawlik · 27 lat w branży AGD</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/producenci" className="rounded-full bg-cream px-5 py-3 text-sm font-semibold text-wine-deep">
                Zobacz ofertę
              </Link>
              <Link href="/kontakt" className="rounded-full border border-cream/40 px-5 py-3 text-sm font-semibold text-cream">
                Porozmawiajmy
              </Link>
            </div>
          </div>
          <div className="grid min-w-0 grid-cols-2 overflow-hidden rounded-2xl bg-white">
            <img src="/media/home/tata.jpg" alt="Piotr Pawlik" className="h-72 w-full object-cover object-top sm:h-[28rem]" fetchPriority="high" />
            <img src="/media/home/firma.jpg" alt="Salon AGD Justowska przy ul. Królowej Jadwigi" className="h-72 w-full object-cover sm:h-[28rem]" />
          </div>
        </div>
      </section>

      <QuoteBand>
        Nasza strona jest mobilna — przyjeżdżamy do klienta do domu i wybieramy ofertę dla ciebie.
      </QuoteBand>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wine">O firmie</p>
          <h2 className="mt-3 font-sans text-4xl font-semibold leading-tight tracking-tight md:text-5xl">27 lat praktyki, jedna zasada.</h2>
        </div>
        <div className="space-y-5 text-base leading-7 text-muted">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <QuoteBand>
        Zapraszamy do sklepu stacjonarnego, gdzie można zobaczyć na żywo podłączone urządzenia i technikę kuchenną różnych producentów. Mamy podpisaną umowę z firmą kurierską DPD i dostarczamy towar w każde miejsce w Polsce.
      </QuoteBand>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-16 md:grid-cols-4">
        <img src="/media/home/hob.jpg" alt="Czarna płyta grzewcza z okapem w blacie" className="h-72 w-full rounded-2xl object-cover md:col-span-2 md:h-full" />
        <div className="grid gap-4 md:col-span-2">
          <img src="/media/home/ovens.jpg" alt="Zabudowa piekarników, mikrofal i chłodziarki do wina" className="h-40 w-full rounded-2xl object-cover" />
          <div className="grid grid-cols-2 gap-4">
            <img src="/media/home/tap.jpg" alt="Czarna bateria kuchenna przy zlewie" className="h-44 w-full rounded-2xl object-cover" />
            <img src="/media/home/sink.jpg" alt="Czarny zlewozmywak granitowy z baterią" className="h-44 w-full rounded-2xl object-cover" />
          </div>
        </div>
        {Array.from({ length: 14 }, (_, index) => (
          <img
            key={index}
            src={`/media/home/stock/${String(index + 1).padStart(2, '0')}.jpg`}
            alt="Zdjęcie sprzętu i wnętrza kuchennego"
            className="h-56 w-full rounded-2xl object-cover sm:h-64"
            loading="lazy"
          />
        ))}
      </section>

      <section className="bg-wine text-cream">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-14 md:grid-cols-4">
          {offers.map((offer) => (
            <article key={offer.title}>
              <h2 className="font-serif text-3xl">{offer.title}</h2>
              <p className="mt-3 text-sm leading-6 text-cream/80">{offer.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
