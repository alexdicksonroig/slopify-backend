import { type Variant } from "../../domain/variants/variant.entity"
import { variantRepository } from "../../infrastructure/persistence/variants/variant.repository"

class GetVariantUseCase {
  async execute(id: number): Promise<Variant | null> {
    return await variantRepository.findById(id)
  }
}

export const getVariantUseCase = new GetVariantUseCase()
