import { type Variant } from "../../domain/variants/variant.entity"
import { variantRepository } from "../../infrastructure/persistence/variants/variant.repository"

export class ListVariantsUseCase {
  async execute(productId: number): Promise<Variant[]> {
    return await variantRepository.findForProduct(productId)
  }
}

export const listVariantsUseCase = new ListVariantsUseCase()
