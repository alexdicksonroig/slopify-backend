import { type Product } from '../domain/product.entity'
import { type ProductRepositoryPort } from '../domain/product.repository'

export class ListProductsUseCase {
  constructor (private readonly productRepository: ProductRepositoryPort) {}

  async execute (): Promise<Product[]> {
    return await this.productRepository.findAll()
  }
}
