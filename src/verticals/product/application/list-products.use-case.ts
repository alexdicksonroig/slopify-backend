import { type Product } from "../domain/product.entity"
import { type ProductSort } from "../domain/product.repository"
import { productRepository } from "../infrastructure/persistence/product.repository"

export class ListProductsUseCase {
  async execute(
    filters?: { optionId: number; valueId: number }[],
    sort?: ProductSort,
  ): Promise<Product[]> {
    return await productRepository.findAll(filters, sort)
  }
}

export const listProductsUseCase = new ListProductsUseCase()
