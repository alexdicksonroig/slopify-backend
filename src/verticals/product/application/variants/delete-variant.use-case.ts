import { variantRepository } from "../../infrastructure/persistence/variants/variant.repository"

export class DeleteVariantUseCase {
  async execute(id: number): Promise<boolean> {
    return await variantRepository.delete(id)
  }
}

export const deleteVariantUseCase = new DeleteVariantUseCase()
