import { type Product } from '../domain/product.entity'
import { type CreateProduct, type ProductRepositoryPort } from '../domain/product.repository'

export class CreateProductUseCase {
  constructor (private readonly productRepository: ProductRepositoryPort) {}

  async execute (input: CreateProduct): Promise<Product> {
    return await this.productRepository.create(input)
  }
}
