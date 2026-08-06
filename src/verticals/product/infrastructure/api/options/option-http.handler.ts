import { type FastifyReply, type FastifyRequest } from 'fastify'
import { createProductOptionUseCase } from '../../../application/options/create-product-option.use-case'
import { listProductOptionsUseCase } from '../../../application/options/list-product-options.use-case'
import { type ProductOption } from '../../../domain/options/product-option.entity'

class OptionHandler {
  list = async (): Promise<ProductOption[]> => {
    return await listProductOptionsUseCase.execute()
  }

  create = async (
    request: FastifyRequest<{
      Body: { possibleValues: string[], label: string }
    }>,
    reply: FastifyReply
  ): Promise<ProductOption> => {
    const option = await createProductOptionUseCase.execute(request.body)
    return await reply.code(201).send(option)
  }
}

export const optionHandler = new OptionHandler()
