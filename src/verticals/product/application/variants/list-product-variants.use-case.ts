import { type ProductVariant } from '../../domain/variants/product-variant.entity'
import { variantRepository } from '../../infrastructure/persistence/variants/variant.repository'

export class ListProductVariantsUseCase {
  async execute (productId: number): Promise<ProductVariant[]> {
    return await variantRepository.findForProduct(productId)
  }
}

export const listProductVariantsUseCase = new ListProductVariantsUseCase()
