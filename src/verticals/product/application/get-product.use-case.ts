import { type Product } from "../domain/product.entity"
import { productRepository } from "../infrastructure/persistence/product.repository"

export class GetProductUseCase {
  async execute(id: number): Promise<Product | null> {
    return await productRepository.findById(id)
  }
}

export const getProductUseCase = new GetProductUseCase()
