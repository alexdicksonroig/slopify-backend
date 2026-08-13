import { type Product } from "../domain/product.entity"
import { type ProductSort } from "../domain/product.repository"
import { productRepository } from "../infrastructure/persistence/product.repository"

export class ListProductsUseCase {
  async execute(
    filters?: { option: string; value: string }[],
    sort?: ProductSort,
  ): Promise<Product[]> {
    return await productRepository.findAll(filters, sort)
  }
}

export const listProductsUseCase = new ListProductsUseCase()
