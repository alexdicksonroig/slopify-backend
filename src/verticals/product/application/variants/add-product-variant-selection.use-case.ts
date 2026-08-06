import { variantRepository } from '../../infrastructure/persistence/variants/variant.repository'

export class AddProductVariantSelectionUseCase {
  async execute (
    variantId: number,
    optionId: number,
    value: string
  ): Promise<void> {
    await variantRepository.addSelection(variantId, optionId, value)
  }
}

export const addProductVariantSelectionUseCase = new AddProductVariantSelectionUseCase()
