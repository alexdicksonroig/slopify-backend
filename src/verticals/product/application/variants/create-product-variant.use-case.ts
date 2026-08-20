import { type ProductVariant } from "../../domain/variants/product-variant.entity"
import { variantRepository } from "../../infrastructure/persistence/variants/variant.repository"

export class CreateProductVariantUseCase {
  async execute(
    productId: number,
    sku: string,
    unitAmount: number,
    currency: string,
  ): Promise<ProductVariant> {
    return await variantRepository.createVariant(productId, sku, unitAmount, currency)
  }
}

export const createProductVariantUseCase = new CreateProductVariantUseCase()
