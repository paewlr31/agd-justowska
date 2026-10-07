import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'O firmie',
  description: 'Forma High i salon AGD Justowska w Krakowie. Piotr Pawlik, 27 lat w branży AGD.',
}

const paragraphs = [
  'Nazywam się Piotr Pawlik. Branżę AGD znam od podszewki – przez niemal trzy dekady pracowałem dla czołowych producentów oraz współpracowałem z architektami i ekipami wykończeniowymi. Wiem dokładnie, jak poszczególne urządzenia sprawdzają się nie tylko na sklepowej ekspozycji, ale przede wszystkim w codziennym, wieloletnim użytkowaniu.',
  'Właśnie dlatego stworzyłem markę Forma High i salon AGD Justowska. To miejsce dla klientów, którzy oczekują profesjonalnego doradztwa i sprzętu precyzyjnie dopasowanego do ich stylu życia oraz projektu wnętrza.',
]

const gains = [
  { title: 'Zero przypadkowych produktów', text: 'Ofertę opieramy wyłącznie na sprawdzonych markach, których mocne i słabe strony znamy z praktyki. Polecamy tylko to, do czego mamy absolutne przekonanie.' },
  { title: 'Kompletny projekt kuchni', text: 'Nie sprzedajemy pojedynczych pudełek. Łączymy AGD do zabudowy z techniką kuchenną — zlewozmywakami i bateriami — oraz blatami ze spieków, konglomeratów i kamienia naturalnego.' },
  { title: 'Elastyczność (salon lub spotkanie na budowie)', text: 'Zapraszamy do salonu przy ul. Królowej Jadwigi w Krakowie, gdzie zobaczysz podłączony sprzęt na żywo. Oferujemy również dojazd i konsultację bezpośrednio u Ciebie w domu – tam, gdzie faktycznie powstaje projekt.' },
  { title: 'Wsparcie wykonawcze', text: 'Mamy w portfolio sprawdzone firmy meblowe i ekipy wykończeniowe. Jeśli potrzebujesz, poprowadzimy realizację Twojego wnętrza od stanu deweloperskiego pod klucz. Dostarczamy sprzęt na miejsce, na terenie całej Polski.' },
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
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sand">AGD Justowska – salon marki Forma High</p>
            <h1 className="mt-4 font-serif text-4xl leading-[1.05] sm:text-6xl md:text-7xl">Ekskluzywne wyposażenie kuchni. Sprzęt, za którym stoimy.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-cream/85 sm:text-lg">
              Nie proponuję rozwiązań, których sam nie zainstalowałbym we własnym domu. Kompletujemy AGD, blaty i technikę kuchenną bez błędów projektowych.
            </p>
            <p className="mt-4 text-sm text-cream/75">Piotr Pawlik · 27 lat w branży AGD</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/producenci" className="rounded-full bg-cream px-5 py-3 text-sm font-semibold text-wine-deep">
                Zobacz ofertę
              </Link>
              <Link href="/kontakt" className="rounded-full bg-sand px-5 py-3 text-sm font-semibold text-wine-deep">
                Porozmawiajmy
              </Link>
            </div>
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-4 overflow-hidden rounded-2xl md:grid-cols-2 md:gap-0 md:bg-white">
            <img src="/media/home/tata.jpg" alt="Piotr Pawlik" className="h-80 w-full rounded-2xl object-cover object-top md:h-[28rem] md:rounded-none" fetchPriority="high" />
            <img src="/media/home/ovens.jpg" alt="Zabudowa piekarników i sprzętu kuchennego" className="h-80 w-full rounded-2xl object-cover md:h-[28rem] md:rounded-none" />
          </div>
        </div>
      </section>

      <QuoteBand>
        Nasza strona jest mobilna — przyjeżdżamy do klienta do domu i wybieramy ofertę dla ciebie.
      </QuoteBand>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wine">O firmie</p>
          <h2 className="mt-3 font-sans text-4xl font-semibold leading-tight tracking-tight md:text-5xl">27 lat praktyki. Jedna bezwzględna zasada.</h2>
        </div>
        <div className="space-y-5 text-base leading-7 text-muted">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <div>
            <h3 className="font-sans text-2xl font-semibold tracking-tight text-wine-ink">Co zyskujesz, współpracując z nami?</h3>
            <ul className="mt-4 space-y-4">
              {gains.map((gain) => (
                <li key={gain.title}>
                  <p className="font-semibold text-wine-ink">{gain.title}</p>
                  <p className="mt-1">{gain.text}</p>
                </li>
              ))}
            </ul>
          </div>
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
      </section>
    </>
  )
}
