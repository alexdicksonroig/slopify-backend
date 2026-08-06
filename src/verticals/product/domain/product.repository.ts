export type CreateProduct = {
  name: string
  description: string | null
  priceInCents: number
}

export type UpdateProduct = Partial<CreateProduct>
