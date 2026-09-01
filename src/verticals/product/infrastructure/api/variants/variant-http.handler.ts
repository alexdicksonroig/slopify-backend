import { type FastifyReply, type FastifyRequest } from "fastify"
import { addVariantSelectionUseCase } from "../../../application/variants/add-variant-selection.use-case"
import { createVariantUseCase } from "../../../application/variants/create-variant.use-case"
import { deleteVariantSelectionUseCase } from "../../../application/variants/delete-variant-selection.use-case"
import { deleteVariantUseCase } from "../../../application/variants/delete-variant.use-case"
import { getVariantUseCase } from "../../../application/variants/get-variant.use-case"
import { listAllVariantsUseCase } from "../../../application/variants/list-all-variants.use-case"
import { listVariantsUseCase } from "../../../application/variants/list-variants.use-case"
import { type Variant } from "../../../domain/variants/variant.entity"
import { r2Adapter } from "../../r2.adapter"
import { parseVariantFilters } from "../../variant-filter-query.adapter"

class VariantHandler {
  list = async (request: FastifyRequest<{ Querystring: Record<string, string> }>) => {
    const variants = await listAllVariantsUseCase.execute(parseVariantFilters(request.query))

    return variants.map((variant) => ({
      id: variant.id,
      productId: variant.productId,
      unitAmount: variant.unitAmount,
      currency: variant.currency,
      thumbnailUrl: variant.thumbnail ? r2Adapter.publicUrl(variant.thumbnail) : null,
      coverUrl: variant.cover ? r2Adapter.publicUrl(variant.cover) : null,
    }))
  }

  get = async (request: FastifyRequest<{ Params: { variantId: string } }>, reply: FastifyReply) => {
    const variant = await getVariantUseCase.execute(Number(request.params.variantId))
    if (!variant) return await reply.code(404).send({ message: "Variant not found" })

    return {
      id: variant.id,
      productId: variant.productId,
      unitAmount: variant.unitAmount,
      currency: variant.currency,
      selections: variant.selections,
      thumbnailUrl: variant.thumbnail ? r2Adapter.publicUrl(variant.thumbnail) : null,
      coverUrl: variant.cover ? r2Adapter.publicUrl(variant.cover) : null,
    }
  }

  listForProduct = async (request: FastifyRequest<{ Params: { productId: string } }>) => {
    const variants = await listVariantsUseCase.execute(Number(request.params.productId))

    return variants.map((variant) => ({
      id: variant.id,
      productId: variant.productId,
      unitAmount: variant.unitAmount,
      currency: variant.currency,
      selections: variant.selections,
      thumbnailUrl: variant.thumbnail ? r2Adapter.publicUrl(variant.thumbnail) : null,
      coverUrl: variant.cover ? r2Adapter.publicUrl(variant.cover) : null,
    }))
  }

  create = async (
    request: FastifyRequest<{
      Params: { productId: string }
      Body: { unitAmount: number; currency: string }
    }>,
    reply: FastifyReply,
  ): Promise<Variant> => {
    const variant = await createVariantUseCase.execute(
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
    const deleted = await deleteVariantUseCase.execute(Number(request.params.variantId))
    if (!deleted) return await reply.code(404).send({ message: "Variant not found" })
    return await reply.code(204).send()
  }

  addSelection = async (
    request: FastifyRequest<{
      Params: { variantId: string }
      Body: { optionId: number; valueId: number }
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    await addVariantSelectionUseCase.execute(
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
    await deleteVariantSelectionUseCase.execute(
      Number(request.params.variantId),
      Number(request.params.optionId),
    )
    await reply.code(204).send()
  }
}

export const variantHandler = new VariantHandler()
