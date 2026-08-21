import { fileTypeFromBuffer } from "file-type"
import { type FastifyReply, type FastifyRequest } from "fastify"
import { DeleteVariantThumbnailUseCase } from "../../../application/variants/delete-variant-thumbnail.use-case"
import { UpdateVariantThumbnailUseCase } from "../../../application/variants/update-variant-thumbnail.use-case"
import { variantThumbnailImageAdapter } from "../../variant-thumbnail-image.adapter"
import { r2Adapter } from "../../r2.adapter"
import { variantRepository } from "../../persistence/variants/variant.repository"

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"])

class VariantThumbnailHandler {
  upload = async (
    request: FastifyRequest<{ Params: { variantId: string } }>,
    reply: FastifyReply,
  ) => {
    const variant = await variantRepository.findById(Number(request.params.variantId))
    if (!variant) return await reply.code(404).send({ message: "Variant not found" })

    const file = await request.file()
    if (!file) return await reply.code(400).send({ message: "A thumbnail file is required" })

    let image: Buffer
    try {
      image = await file.toBuffer()
    } catch (error) {
      if ((error as { code?: string }).code === "FST_REQ_FILE_TOO_LARGE") {
        return await reply.code(413).send({ message: "Variant Thumbnail must not exceed 500 KB" })
      }
      throw error
    }

    const type = await fileTypeFromBuffer(image)
    if (!type || !acceptedTypes.has(type.mime)) {
      return await reply
        .code(415)
        .send({ message: "Variant Thumbnail must be a JPEG, PNG, or WebP image" })
    }

    const webpImage = await variantThumbnailImageAdapter.convertToWebp(image)
    await new UpdateVariantThumbnailUseCase().execute(variant, webpImage, {
      ext: "webp",
      mime: "image/webp",
    })

    return {
      id: variant.id,
      thumbnailUrl: r2Adapter.publicUrl(variant.thumbnail!),
    }
  }

  remove = async (
    request: FastifyRequest<{ Params: { variantId: string } }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> => {
    const variant = await variantRepository.findById(Number(request.params.variantId))
    if (!variant) return await reply.code(404).send({ message: "Variant not found" })

    await new DeleteVariantThumbnailUseCase().execute(variant)
    return await reply.code(204).send()
  }
}

export const variantThumbnailHandler = new VariantThumbnailHandler()
