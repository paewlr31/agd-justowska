'use client'

import { FormEvent, useState } from 'react'

export function ContactForm({ accessKey }: { accessKey: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    if (String(form.get('botcheck') ?? '')) return
    if (!accessKey) {
      const name = String(form.get('name') ?? '')
      const email = String(form.get('email') ?? '')
      const phone = String(form.get('phone') ?? '')
      const message = String(form.get('message') ?? '')
      const body = encodeURIComponent(`Imię i nazwisko: ${name}\nE-mail: ${email}\nTelefon: ${phone}\n\n${message}`)
      window.location.href = `mailto:biuro@agdjustowska.pl?subject=${encodeURIComponent('Wiadomość ze strony AGD Justowska')}&body=${body}`
      return
    }
    setStatus('sending')
    setError('')
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          subject: 'Wiadomość ze strony AGD Justowska',
          from_name: 'Strona AGD Justowska',
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          message: form.get('message'),
          botcheck: form.get('botcheck') ?? '',
        }),
      })
      const data = (await response.json()) as { success?: boolean; message?: string }
      if (!response.ok || !data.success) {
        setStatus('error')
        setError(data.message || 'Nie udało się wysłać wiadomości. Zadzwoń do salonu.')
        return
      }
      setStatus('sent')
      event.currentTarget.reset()
    } catch {
      setStatus('error')
      setError('Nie udało się wysłać wiadomości. Sprawdź internet albo zadzwoń do salonu.')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-3xl bg-wine-deep p-8 text-cream md:p-10">
        <h2 className="font-serif text-4xl">Dziękujemy.</h2>
        <p className="mt-3 text-cream/80">Wiadomość jest w drodze na biuro@agdjustowska.pl. Odezwiemy się.</p>
        <button type="button" className="mt-6 text-sm font-semibold text-sand underline" onClick={() => setStatus('idle')}>
          Wyślij kolejną
        </button>
      </div>
    )
  }

  return (
    <form className="rounded-3xl bg-wine-deep p-8 text-cream md:p-10" onSubmit={onSubmit}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sand">Napisz do nas</p>
      <h2 className="mt-3 font-serif text-4xl">Opowiedz, czego szukasz.</h2>
      <input type="text" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />
      <div className="mt-8 space-y-5">
        <label className="block text-sm text-cream/70">
          Imię i nazwisko
          <input name="name" required autoComplete="name" className="dark-field" placeholder="Jak się do Ciebie zwracać?" />
        </label>
        <label className="block text-sm text-cream/70">
          E-mail
          <input name="email" type="email" required autoComplete="email" className="dark-field" placeholder="ty@przyklad.pl" />
        </label>
        <label className="block text-sm text-cream/70">
          Telefon
          <input name="phone" type="tel" autoComplete="tel" className="dark-field" placeholder="nieobowiązkowo" />
        </label>
        <label className="block text-sm text-cream/70">
          Wiadomość
          <textarea name="message" required className="dark-field min-h-32 resize-y" placeholder="Marka, model albo czego potrzebuje kuchnia." />
        </label>
        {error ? <p className="text-sm text-sand">{error}</p> : null}
        <button type="submit" disabled={status === 'sending'} className="w-full rounded-full bg-cream py-3 text-sm font-semibold text-wine-deep disabled:opacity-60">
          {status === 'sending' ? 'Wysyłam…' : 'Wyślij wiadomość'}
        </button>
      </div>
    </form>
  )
}
