import { type FastifyReply, type FastifyRequest } from 'fastify'
import { CreateVariantUseCase } from '../../application/create-variant.use-case'
import { ListVariantsUseCase } from '../../application/list-variants.use-case'
import {
  type CreateVariantBody,
  type VariantResponse
} from './variant-http.dtos'

const variantCreator = new CreateVariantUseCase()
const variantLister = new ListVariantsUseCase()

class VariantHandler {
  list = async (): Promise<VariantResponse[]> => {
    return await variantLister.execute()
  }

  create = async (
    request: FastifyRequest<{ Body: CreateVariantBody }>,
    reply: FastifyReply
  ): Promise<VariantResponse> => {
    const variant = await variantCreator.execute(request.body)
    return await reply.code(201).send(variant)
  }
}

export const variantHandler = new VariantHandler()
