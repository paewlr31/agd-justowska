import { NextResponse } from 'next/server'

export function fail(error: unknown) {
  const message = error instanceof Error ? error.message : 'Nie udało się zapisać.'
  const status = /README|Supabase|tabel|podłącz/.test(message) ? 503 : 400
  return NextResponse.json({ error: message }, { status })
}
