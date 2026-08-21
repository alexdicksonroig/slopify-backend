import { type ProductVariantWithProduct } from "../../domain/variants/product-variant.entity"
import { variantRepository } from "../../infrastructure/persistence/variants/variant.repository"

class GetProductVariantUseCase {
  async execute(id: number): Promise<ProductVariantWithProduct | null> {
    return await variantRepository.findById(id)
  }
}

export const getProductVariantUseCase = new GetProductVariantUseCase()
