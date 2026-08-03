import { type Product } from '../domain/product.entity'
import { type ProductRepositoryPort, type UpdateProduct } from '../domain/product.repository'

export class UpdateProductUseCase {
  constructor (private readonly productRepository: ProductRepositoryPort) {}

  async execute (id: number, input: UpdateProduct): Promise<Product | null> {
    return await this.productRepository.update(id, input)
  }
}
