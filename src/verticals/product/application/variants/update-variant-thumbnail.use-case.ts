import { randomUUID } from "node:crypto"
import { type Variant } from "../../domain/variants/variant.entity"
import { r2Adapter } from "../../infrastructure/r2.adapter"
import { variantRepository } from "../../infrastructure/persistence/variants/variant.repository"

export class UpdateVariantThumbnailUseCase {
  async execute(
    variant: Variant,
    image: Buffer,
    type: { ext: string; mime: string },
  ): Promise<Variant> {
    const previousReference = variant.thumbnail
    const reference = `variant-thumbnails/${variant.id}/${randomUUID()}.${type.ext}`

    await r2Adapter.upload(reference, image, type.mime)
    variant.replaceThumbnail(reference)
    await variantRepository.setThumbnail(variant)

    if (previousReference) void r2Adapter.delete(previousReference).catch(() => {})
    return variant
  }
}
