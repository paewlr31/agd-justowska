import type { Catalog } from '@/lib/types'

export type CategoryMenuItem = {
  id: string
  brand: string
  model: string
  href: string
  image: string | null
}

export type CategoryMenu = {
  name: string
  items: CategoryMenuItem[]
}

export function categoryMenus(catalog: Catalog): CategoryMenu[] {
  const slugByBrand = new Map(catalog.manufacturers.map((item) => [item.name, item.slug]))
  const groups = new Map<string, CategoryMenuItem[]>()

  for (const product of catalog.products) {
    const slug = slugByBrand.get(product.brand)
    if (!slug) continue
    const items = groups.get(product.category) ?? []
    items.push({
      id: product.id,
      brand: product.brand,
      model: product.model,
      href: `/producenci/${slug}/${product.id}`,
      image: product.image,
    })
    groups.set(product.category, items)
  }

  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], 'pl'))
    .map(([name, items]) => ({
      name,
      items: items.sort((a, b) => a.brand.localeCompare(b.brand, 'pl') || a.model.localeCompare(b.model, 'pl')),
    }))
}
