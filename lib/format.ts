export function formatPrice(price: number | null) {
  if (price == null || Number.isNaN(price)) return 'Cena na zapytanie'
  const fraction = Number.isInteger(price) ? 0 : 2
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
  }).format(price)
}

export function modelsLabel(count: number) {
  if (count === 0) return 'oferta w przygotowaniu'
  const mod10 = count % 10
  const mod100 = count % 100
  if (count === 1) return '1 model'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} modele`
  return `${count} modeli`
}

export function parsePrice(raw: string) {
  const cleaned = raw.trim().replace(/\s/g, '').replace(',', '.')
  if (!cleaned) return null
  const value = Number(cleaned)
  if (!Number.isFinite(value) || value < 0 || value > 10_000_000) {
    throw new Error('Podaj cenę jako liczbę, na przykład 6999.')
  }
  return Math.round(value * 100) / 100
}

export function cleanLine(value: string, max: number, label: string) {
  const text = value.replace(/\s+/g, ' ').trim()
  if (!text) throw new Error(`Uzupełnij pole: ${label}.`)
  if (text.length > max) throw new Error(`${label} może mieć najwyżej ${max} znaków.`)
  return text
}

export function cleanMultiline(value: string, max: number) {
  const text = value.replace(/\r\n/g, '\n').trim()
  if (text.length > max) throw new Error(`Opis może mieć najwyżej ${max} znaków.`)
  return text
}
