import { variantRepository } from "../../infrastructure/persistence/variants/variant.repository"

export class AddVariantSelectionUseCase {
  async execute(variantId: number, optionId: string, valueId: number): Promise<void> {
    await variantRepository.addSelection(variantId, optionId, valueId)
  }
}

export const addVariantSelectionUseCase = new AddVariantSelectionUseCase()
