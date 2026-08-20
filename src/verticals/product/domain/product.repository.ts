export type CreateProduct = {
  name: string
  description: string | null
}

export type UpdateProduct = Partial<CreateProduct>

export type ProductSort = "newest" | "price-asc" | "price-desc"
