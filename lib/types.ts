export type Manufacturer = {
  slug: string
  name: string
  categories: string[]
  sortOrder: number
}

export type Product = {
  id: string
  brand: string
  model: string
  category: string
  price: number | null
  description: string
  image: string | null
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
  image?: UploadedImage | null
  removeImage?: boolean
}
