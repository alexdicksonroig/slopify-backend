import { type VariantInList } from "../../domain/variants/variant.entity"
import { variantRepository } from "../../infrastructure/persistence/variants/variant.repository"

class ListAllVariantsUseCase {
  async execute(filters: { optionId: number; valueId: number }[]): Promise<VariantInList[]> {
    return await variantRepository.findAll(filters)
  }
}

export const listAllVariantsUseCase = new ListAllVariantsUseCase()
