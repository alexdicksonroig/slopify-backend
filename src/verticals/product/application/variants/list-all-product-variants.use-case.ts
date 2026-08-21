import { type VariantInList } from "../../domain/variants/product-variant.entity"
import { variantRepository } from "../../infrastructure/persistence/variants/variant.repository"

class ListAllProductVariantsUseCase {
  async execute(filters: { optionId: number; valueId: number }[]): Promise<VariantInList[]> {
    return await variantRepository.findAll(filters)
  }
}

export const listAllProductVariantsUseCase = new ListAllProductVariantsUseCase()
