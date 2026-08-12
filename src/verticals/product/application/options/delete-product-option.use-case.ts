import { optionRepository } from "../../infrastructure/persistence/options/option.repository"

export class DeleteProductOptionUseCase {
  async execute(id: number): Promise<boolean> {
    return await optionRepository.delete(id)
  }
}

export const deleteProductOptionUseCase = new DeleteProductOptionUseCase()
