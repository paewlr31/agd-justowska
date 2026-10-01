export type Manufacturer = {
  slug: string
  name: string
  categories: string[]
  sortOrder: number
}

export type ProductFile = {
  url: string
  name: string
}

export type Product = {
  id: string
  brand: string
  model: string
  category: string
  price: number | null
  description: string
  features: string
  energyClass: string | null
  image: string | null
  images: string[]
  files: ProductFile[]
  createdAt: string
}

export type GalleryItem = {
  id: string
  image: string
  caption: string
  createdAt: string
}

export type Catalog = {
  manufacturers: Manufacturer[]
  products: Product[]
  gallery: GalleryItem[]
}

export type UploadedImage = {
  buffer: Buffer
  contentType: string
  filename: string
}

export type ProductInput = {
  brand: string
  model: string
  category: string
  price: number | null
  description: string
  features: string
  energyClass: string | null
  images: UploadedImage[]
  files: UploadedImage[]
  removeImages: string[]
  removeFiles: string[]
}
