import { type Product } from '../domain/product.entity'
import { type ProductRepositoryPort } from '../domain/product.repository'

export class GetProductUseCase {
  constructor (private readonly productRepository: ProductRepositoryPort) {}

  async execute (id: number): Promise<Product | null> {
    return await this.productRepository.findById(id)
  }
}
