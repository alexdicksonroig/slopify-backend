import { type FastifyReply, type FastifyRequest } from "fastify"
import { addProductVariantSelectionUseCase } from "../../../application/variants/add-product-variant-selection.use-case"
import { createProductVariantUseCase } from "../../../application/variants/create-product-variant.use-case"
import { deleteProductVariantSelectionUseCase } from "../../../application/variants/delete-product-variant-selection.use-case"
import { deleteProductVariantUseCase } from "../../../application/variants/delete-product-variant.use-case"
import { getProductVariantUseCase } from "../../../application/variants/get-product-variant.use-case"
import { listAllProductVariantsUseCase } from "../../../application/variants/list-all-product-variants.use-case"
import { listProductVariantsUseCase } from "../../../application/variants/list-product-variants.use-case"
import { type ProductVariant } from "../../../domain/variants/product-variant.entity"
import { r2Adapter } from "../../r2.adapter"
import { parseVariantFilters } from "../../variant-filter-query.adapter"

class VariantHandler {
  list = async (request: FastifyRequest<{ Querystring: Record<string, string> }>) => {
    const variants = await listAllProductVariantsUseCase.execute(parseVariantFilters(request.query))

    return variants.map((variant) => ({
      id: variant.id,
      unitAmount: variant.unitAmount,
      currency: variant.currency,
      product: {
        id: variant.product.id,
        name: variant.product.name,
        description: variant.product.description,
        thumbnailUrl: variant.product.thumbnail
          ? r2Adapter.publicUrl(variant.product.thumbnail)
          : null,
      },
    }))
  }

  get = async (request: FastifyRequest<{ Params: { variantId: string } }>, reply: FastifyReply) => {
    const variant = await getProductVariantUseCase.execute(Number(request.params.variantId))
    if (!variant) return await reply.code(404).send({ message: "Product variant not found" })

    return {
      id: variant.id,
      productId: variant.productId,
      unitAmount: variant.unitAmount,
      currency: variant.currency,
      selections: variant.selections,
      product: {
        id: variant.product.id,
        name: variant.product.name,
        description: variant.product.description,
        thumbnailUrl: variant.product.thumbnail
          ? r2Adapter.publicUrl(variant.product.thumbnail)
          : null,
      },
    }
  }

  listForProduct = async (
    request: FastifyRequest<{ Params: { productId: string } }>,
  ): Promise<ProductVariant[]> => {
    return await listProductVariantsUseCase.execute(Number(request.params.productId))
  }

  create = async (
    request: FastifyRequest<{
      Params: { productId: string }
      Body: { unitAmount: number; currency: string }
    }>,
    reply: FastifyReply,
  ): Promise<ProductVariant> => {
    const variant = await createProductVariantUseCase.execute(
      Number(request.params.productId),
      request.body.unitAmount,
      request.body.currency.toLowerCase(),
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
      Body: { optionId: number; valueId: number }
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    await addProductVariantSelectionUseCase.execute(
      Number(request.params.variantId),
      request.body.optionId,
      request.body.valueId,
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
