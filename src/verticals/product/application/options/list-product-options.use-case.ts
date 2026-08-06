import { type ProductOption } from "../../domain/options/product-option.entity"
import { optionRepository } from "../../infrastructure/persistence/options/option.repository"

export class ListProductOptionsUseCase {
  async execute(): Promise<ProductOption[]> {
    return await optionRepository.getAll()
  }
}

export const listProductOptionsUseCase = new ListProductOptionsUseCase()
