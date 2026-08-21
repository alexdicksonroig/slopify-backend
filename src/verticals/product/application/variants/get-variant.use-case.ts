import { type VariantWithProduct } from "../../domain/variants/variant.entity"
import { variantRepository } from "../../infrastructure/persistence/variants/variant.repository"

class GetVariantUseCase {
  async execute(id: number): Promise<VariantWithProduct | null> {
    return await variantRepository.findById(id)
  }
}

export const getVariantUseCase = new GetVariantUseCase()
