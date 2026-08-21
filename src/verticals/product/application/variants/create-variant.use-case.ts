import { type Variant } from "../../domain/variants/variant.entity"
import { variantRepository } from "../../infrastructure/persistence/variants/variant.repository"

export class CreateVariantUseCase {
  async execute(productId: number, unitAmount: number, currency: string): Promise<Variant> {
    return await variantRepository.createVariant(productId, unitAmount, currency)
  }
}

export const createVariantUseCase = new CreateVariantUseCase()
