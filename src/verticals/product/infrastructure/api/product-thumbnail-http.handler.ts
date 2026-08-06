import { fileTypeFromBuffer } from "file-type"
import { type FastifyReply, type FastifyRequest } from "fastify"
import { DeleteProductThumbnailUseCase } from "../../application/delete-product-thumbnail.use-case"
import { UpdateProductThumbnailUseCase } from "../../application/update-product-thumbnail.use-case"
import { productRepository } from "../persistence/product.repository"
import { productThumbnailImageAdapter } from "../product-thumbnail-image.adapter"
import { r2Adapter } from "../r2.adapter"
const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"])

class ProductThumbnailHandler {
  upload = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const product = await productRepository.findById(Number(request.params.id))
    if (!product) return await reply.code(404).send({ message: "Product not found" })

    const file = await request.file()
    if (!file) return await reply.code(400).send({ message: "A thumbnail file is required" })

    let image: Buffer
    try {
      image = await file.toBuffer()
    } catch (error) {
      if ((error as { code?: string }).code === "FST_REQ_FILE_TOO_LARGE") {
        return await reply.code(413).send({ message: "Product Thumbnail must not exceed 500 KB" })
      }
      throw error
    }

    const type = await fileTypeFromBuffer(image)
    if (!type || !acceptedTypes.has(type.mime)) {
      return await reply
        .code(415)
        .send({ message: "Product Thumbnail must be a JPEG, PNG, or WebP image" })
    }

    const webpImage = await productThumbnailImageAdapter.convertToWebp(image)
    await new UpdateProductThumbnailUseCase().execute(product, webpImage, {
      ext: "webp",
      mime: "image/webp",
    })
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      priceInCents: product.priceInCents,
      thumbnailUrl: r2Adapter.publicUrl(product.thumbnail!),
    }
  }

  remove = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> => {
    const product = await productRepository.findById(Number(request.params.id))
    if (!product) return await reply.code(404).send({ message: "Product not found" })

    await new DeleteProductThumbnailUseCase().execute(product)
    return await reply.code(204).send()
  }
}

export const productThumbnailHandler = new ProductThumbnailHandler()
