import { fileTypeFromBuffer } from "file-type"
import { type FastifyReply, type FastifyRequest } from "fastify"
import { DeleteVariantCoverUseCase } from "../../../application/variants/delete-variant-cover.use-case"
import { DeleteVariantThumbnailUseCase } from "../../../application/variants/delete-variant-thumbnail.use-case"
import { UpdateVariantCoverUseCase } from "../../../application/variants/update-variant-cover.use-case"
import { UpdateVariantThumbnailUseCase } from "../../../application/variants/update-variant-thumbnail.use-case"
import { variantImageAdapter } from "../../variant-image.adapter"
import { r2Adapter } from "../../r2.adapter"
import { variantRepository } from "../../persistence/variants/variant.repository"

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"])

class VariantImageHandler {
  private readImage = async (
    request: FastifyRequest<{ Params: { variantId: string } }>,
    reply: FastifyReply,
  ): Promise<Buffer | FastifyReply> => {
    const file = await request.file()
    if (!file) return await reply.code(400).send({ message: "An image file is required" })

    let image: Buffer
    try {
      image = await file.toBuffer()
    } catch (error) {
      if ((error as { code?: string }).code === "FST_REQ_FILE_TOO_LARGE") {
        return await reply.code(413).send({ message: "Variant image must not exceed 5 MB" })
      }
      throw error
    }

    const type = await fileTypeFromBuffer(image)
    if (!type || !acceptedTypes.has(type.mime)) {
      return await reply
        .code(415)
        .send({ message: "Variant image must be a JPEG, PNG, or WebP image" })
    }

    return image
  }

  uploadThumbnail = async (
    request: FastifyRequest<{ Params: { variantId: string } }>,
    reply: FastifyReply,
  ) => {
    const variant = await variantRepository.findById(Number(request.params.variantId))
    if (!variant) return await reply.code(404).send({ message: "Variant not found" })

    const image = await this.readImage(request, reply)
    if (!Buffer.isBuffer(image)) return image
    const webpImage = await variantImageAdapter.convertToWebp(image, 300, 300)
    await new UpdateVariantThumbnailUseCase().execute(variant, webpImage)

    return {
      id: variant.id,
      imageUrl: r2Adapter.publicUrl(variant.thumbnail!),
    }
  }

  uploadCover = async (
    request: FastifyRequest<{ Params: { variantId: string } }>,
    reply: FastifyReply,
  ) => {
    const variant = await variantRepository.findById(Number(request.params.variantId))
    if (!variant) return await reply.code(404).send({ message: "Variant not found" })

    const image = await this.readImage(request, reply)
    if (!Buffer.isBuffer(image)) return image
    const webpImage = await variantImageAdapter.convertToWebp(image, 1200, 675)
    await new UpdateVariantCoverUseCase().execute(variant, webpImage)

    return {
      id: variant.id,
      imageUrl: r2Adapter.publicUrl(variant.cover!),
    }
  }

  removeThumbnail = async (
    request: FastifyRequest<{ Params: { variantId: string } }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> => {
    const variant = await variantRepository.findById(Number(request.params.variantId))
    if (!variant) return await reply.code(404).send({ message: "Variant not found" })

    await new DeleteVariantThumbnailUseCase().execute(variant)
    return await reply.code(204).send()
  }

  removeCover = async (
    request: FastifyRequest<{ Params: { variantId: string } }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> => {
    const variant = await variantRepository.findById(Number(request.params.variantId))
    if (!variant) return await reply.code(404).send({ message: "Variant not found" })

    await new DeleteVariantCoverUseCase().execute(variant)
    return await reply.code(204).send()
  }
}

export const variantImageHandler = new VariantImageHandler()
