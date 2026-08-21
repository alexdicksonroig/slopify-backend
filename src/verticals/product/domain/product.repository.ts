export type CreateProduct = {
  name: string
  description: string | null
}

export type UpdateProduct = Partial<CreateProduct>
