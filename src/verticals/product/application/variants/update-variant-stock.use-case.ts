import { type Variant } from "../../domain/variants/variant.entity"
import { variantRepository } from "../../infrastructure/persistence/variants/variant.repository"

export class UpdateVariantStockUseCase {
  async execute(variant: Variant, stock: number): Promise<Variant> {
    variant.setStock(stock)
    await variantRepository.setStock(variant)
    return variant
  }
}

export const updateVariantStockUseCase = new UpdateVariantStockUseCase()
