export const ENERGY_CLASSES = ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'] as const

export function parseEnergyClass(raw: string) {
  const value = raw.trim()
  if (!value) return null
  if (!ENERGY_CLASSES.includes(value as (typeof ENERGY_CLASSES)[number])) {
    throw new Error('Wybierz klasę energetyczną z listy.')
  }
  return value
}
