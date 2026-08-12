import { type FastifyReply, type FastifyRequest } from "fastify"
import { createProductOptionUseCase } from "../../../application/options/create-product-option.use-case"
import { deleteProductOptionUseCase } from "../../../application/options/delete-product-option.use-case"
import { listProductOptionsUseCase } from "../../../application/options/list-product-options.use-case"
import { type ProductOption } from "../../../domain/options/product-option.entity"

class OptionHandler {
  list = async (): Promise<ProductOption[]> => {
    return await listProductOptionsUseCase.execute()
  }

  delete = async (
    request: FastifyRequest<{ Params: { optionId: string } }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> => {
    const deleted = await deleteProductOptionUseCase.execute(Number(request.params.optionId))
    if (!deleted) return await reply.code(404).send({ message: "Product option not found" })
    return await reply.code(204).send()
  }

  create = async (
    request: FastifyRequest<{
      Body: { possibleValues: string[]; label: string }
    }>,
    reply: FastifyReply,
  ): Promise<ProductOption> => {
    const option = await createProductOptionUseCase.execute(request.body)
    return await reply.code(201).send(option)
  }
}

export const optionHandler = new OptionHandler()
