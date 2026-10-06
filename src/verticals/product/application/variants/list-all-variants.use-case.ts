import { type Variant } from "../../domain/variants/variant.entity"
import { variantRepository } from "../../infrastructure/persistence/variants/variant.repository"

class ListAllVariantsUseCase {
  async execute(
    filters: { optionId: string; valueId: number }[],
    search?: string,
  ): Promise<Variant[]> {
    return await variantRepository.findAll(filters, search)
  }
}

export const listAllVariantsUseCase = new ListAllVariantsUseCase()
