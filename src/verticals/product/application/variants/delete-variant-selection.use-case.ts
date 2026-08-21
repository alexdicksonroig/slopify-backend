import { variantRepository } from "../../infrastructure/persistence/variants/variant.repository"

export class DeleteVariantSelectionUseCase {
  async execute(variantId: number, optionId: number): Promise<void> {
    await variantRepository.deleteSelection(variantId, optionId)
  }
}

export const deleteVariantSelectionUseCase = new DeleteVariantSelectionUseCase()
