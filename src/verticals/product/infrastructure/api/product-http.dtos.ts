export type GetProductParams = {
  id: string
}

export type CreateProductBody = {
  name: string
  description?: string | null
  priceInCents: number
}

export type UpdateProductBody = Partial<CreateProductBody>

export type ProductResponse = {
  id: number
  name: string
  description: string | null
  priceInCents: number
  thumbnailUrl: string | null
}
