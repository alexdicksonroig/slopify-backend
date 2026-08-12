import { variantRepository } from "../../infrastructure/persistence/variants/variant.repository"

export class DeleteProductVariantUseCase {
  async execute(id: number): Promise<boolean> {
    return await variantRepository.delete(id)
  }
}

export const deleteProductVariantUseCase = new DeleteProductVariantUseCase()
