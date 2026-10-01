'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PanelBar } from '@/components/panel-bar'

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    const password = String(new FormData(event.currentTarget).get('password') ?? '')
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(data.error || 'Nie udało się zalogować.')
        setPending(false)
        return
      }
      router.push('/panel')
      router.refresh()
    } catch {
      setError('Brak połączenia.')
      setPending(false)
    }
  }

  return (
    <>
      <PanelBar />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16">
        <h1 className="font-serif text-4xl">Wejście do panelu</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Tu dodajesz i usuwasz produkty oraz zdjęcia galerii. Ten adres nie jest podlinkowany na stronie dla klientów.</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block text-sm font-medium">
            Hasło
            <input name="password" type="password" required autoComplete="current-password" className="field" />
          </label>
          {error ? <p className="text-sm font-medium text-wine">{error}</p> : null}
          <button type="submit" disabled={pending} className="rounded-full bg-wine px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {pending ? 'Sprawdzam…' : 'Wejdź'}
          </button>
        </form>
      </main>
    </>
  )
}
