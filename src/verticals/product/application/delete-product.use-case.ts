import { productRepository } from '../infrastructure/persistence/product.repository'

export class DeleteProductUseCase {
  async execute (id: number): Promise<boolean> {
    return await productRepository.delete(id)
  }
}

export const deleteProductUseCase = new DeleteProductUseCase()
