import { type ProductOption } from "../../domain/options/product-option.entity"
import {
  type CreateProductOption,
  optionRepository,
} from "../../infrastructure/persistence/options/option.repository"

export class CreateProductOptionUseCase {
  async execute(input: CreateProductOption): Promise<ProductOption> {
    return await optionRepository.create(input)
  }
}

export const createProductOptionUseCase = new CreateProductOptionUseCase()
