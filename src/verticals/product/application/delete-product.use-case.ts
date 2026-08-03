import { type ProductRepositoryPort } from '../domain/product.repository'

export class DeleteProductUseCase {
  constructor (private readonly productRepository: ProductRepositoryPort) {}

  async execute (id: number): Promise<boolean> {
    return await this.productRepository.delete(id)
  }
}
