import { type Product } from "../domain/product.entity"
import { type UpdateProduct } from "../domain/product.repository"
import { productRepository } from "../infrastructure/persistence/product.repository"

export class UpdateProductUseCase {
  async execute(id: number, input: UpdateProduct): Promise<Product | null> {
    return await productRepository.update(id, input)
  }
}

export const updateProductUseCase = new UpdateProductUseCase()
