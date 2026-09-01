import { type Variant } from "../../domain/variants/variant.entity"
import { r2Adapter } from "../../infrastructure/r2.adapter"
import { variantRepository } from "../../infrastructure/persistence/variants/variant.repository"

export class DeleteVariantCoverUseCase {
  async execute(variant: Variant): Promise<void> {
    if (!variant.cover) return

    const reference = variant.cover
    variant.removeCover()
    await variantRepository.setCover(variant)
    await r2Adapter.delete(reference)
  }
}
