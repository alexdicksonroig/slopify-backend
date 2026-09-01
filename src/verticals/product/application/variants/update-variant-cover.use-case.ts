import { randomUUID } from "node:crypto"
import { type Variant } from "../../domain/variants/variant.entity"
import { r2Adapter } from "../../infrastructure/r2.adapter"
import { variantRepository } from "../../infrastructure/persistence/variants/variant.repository"

export class UpdateVariantCoverUseCase {
  async execute(variant: Variant, image: Buffer): Promise<Variant> {
    const previousReference = variant.cover
    const reference = `variant-images/${variant.id}/cover/${randomUUID()}.webp`

    await r2Adapter.upload(reference, image, "image/webp")
    variant.replaceCover(reference)
    await variantRepository.setCover(variant)

    if (previousReference) void r2Adapter.delete(previousReference).catch(() => {})
    return variant
  }
}
