export function PageIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <section className="bg-wine-deep text-cream">
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sand">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-none md:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-cream/80">{text}</p>
      </div>
    </section>
  )
}
