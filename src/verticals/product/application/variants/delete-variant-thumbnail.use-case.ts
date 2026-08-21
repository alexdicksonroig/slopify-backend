import { type Variant } from "../../domain/variants/variant.entity"
import { r2Adapter } from "../../infrastructure/r2.adapter"
import { variantRepository } from "../../infrastructure/persistence/variants/variant.repository"

export class DeleteVariantThumbnailUseCase {
  async execute(variant: Variant): Promise<void> {
    if (!variant.thumbnail) return

    const reference = variant.thumbnail
    variant.removeThumbnail()
    await variantRepository.setThumbnail(variant)
    void r2Adapter.delete(reference).catch(() => {})
  }
}
