import { type FastifyReply, type FastifyRequest } from "fastify"
import { addProductVariantSelectionUseCase } from "../../../application/variants/add-product-variant-selection.use-case"
import { createProductVariantUseCase } from "../../../application/variants/create-product-variant.use-case"
import { deleteProductVariantSelectionUseCase } from "../../../application/variants/delete-product-variant-selection.use-case"
import { deleteProductVariantUseCase } from "../../../application/variants/delete-product-variant.use-case"
import { listProductVariantsUseCase } from "../../../application/variants/list-product-variants.use-case"
import { type ProductVariant } from "../../../domain/variants/product-variant.entity"
class VariantHandler {
  listForProduct = async (
    request: FastifyRequest<{ Params: { productId: string } }>,
  ): Promise<ProductVariant[]> => {
    return await listProductVariantsUseCase.execute(Number(request.params.productId))
  }

  create = async (
    request: FastifyRequest<{
      Params: { productId: string }
      Body: { sku: string }
    }>,
    reply: FastifyReply,
  ): Promise<ProductVariant> => {
    const variant = await createProductVariantUseCase.execute(
      Number(request.params.productId),
      request.body.sku,
    )
    return await reply.code(201).send(variant)
  }

  delete = async (
    request: FastifyRequest<{ Params: { variantId: string } }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> => {
    const deleted = await deleteProductVariantUseCase.execute(Number(request.params.variantId))
    if (!deleted) return await reply.code(404).send({ message: "Product variant not found" })
    return await reply.code(204).send()
  }

  addSelection = async (
    request: FastifyRequest<{
      Params: { variantId: string }
      Body: { optionId: number; value: string }
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    await addProductVariantSelectionUseCase.execute(
      Number(request.params.variantId),
      request.body.optionId,
      request.body.value,
    )
    await reply.code(204).send()
  }

  deleteSelection = async (
    request: FastifyRequest<{
      Params: { variantId: string; optionId: string }
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    await deleteProductVariantSelectionUseCase.execute(
      Number(request.params.variantId),
      Number(request.params.optionId),
    )
    await reply.code(204).send()
  }
}

export const variantHandler = new VariantHandler()
