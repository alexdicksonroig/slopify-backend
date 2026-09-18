import { type Variant } from "../../domain/variants/variant.entity"
import { variantRepository } from "../../infrastructure/persistence/variants/variant.repository"

export class CreateVariantUseCase {
  async execute(
    productId: number,
    unitAmount: number,
    currency: string,
    stock: number,
  ): Promise<Variant> {
    return await variantRepository.createVariant(productId, unitAmount, currency, stock)
  }
}

export const createVariantUseCase = new CreateVariantUseCase()
