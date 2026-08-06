import { type Product } from "../domain/product.entity"
import { productRepository } from "../infrastructure/persistence/product.repository"

export class ListProductsUseCase {
  async execute(filter?: { option: string; value: string }): Promise<Product[]> {
    return await productRepository.findAll(filter)
  }
}

export const listProductsUseCase = new ListProductsUseCase()
