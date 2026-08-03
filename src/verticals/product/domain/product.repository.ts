import { type Product } from './product.entity'

export type CreateProduct = {
  name: string
  description: string | null
  priceInCents: number
}

export type UpdateProduct = Partial<CreateProduct>

export interface ProductRepositoryPort {
  findAll(): Promise<Product[]>
  findById(id: number): Promise<Product | null>
  create(product: CreateProduct): Promise<Product>
  update(id: number, product: UpdateProduct): Promise<Product | null>
  delete(id: number): Promise<boolean>
}
