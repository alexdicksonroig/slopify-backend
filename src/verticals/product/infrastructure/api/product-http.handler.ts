import { type FastifyReply, type FastifyRequest } from "fastify"
import { createProductUseCase } from "../../application/create-product.use-case"
import { deleteProductUseCase } from "../../application/delete-product.use-case"
import { getProductUseCase } from "../../application/get-product.use-case"
import { listProductsUseCase } from "../../application/list-products.use-case"
import { updateProductUseCase } from "../../application/update-product.use-case"

class ProductHandler {
  list = async () => {
    const products = await listProductsUseCase.execute()
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
    }))
  }

  get = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const product = await getProductUseCase.execute(Number(request.params.id))
    if (!product) return await reply.code(404).send({ message: "Product not found" })

    return {
      id: product.id,
      name: product.name,
      description: product.description,
    }
  }

  create = async (
    request: FastifyRequest<{
      Body: {
        name: string
        description?: string | null
      }
    }>,
    reply: FastifyReply,
  ) => {
    const product = await createProductUseCase.execute({
      ...request.body,
      description: request.body.description ?? null,
    })
    return await reply.code(201).send({
      id: product.id,
      name: product.name,
      description: product.description,
    })
  }

  update = async (
    request: FastifyRequest<{
      Params: { id: string }
      Body: Partial<{
        name: string
        description?: string | null
      }>
    }>,
    reply: FastifyReply,
  ) => {
    const product = await updateProductUseCase.execute(Number(request.params.id), request.body)
    if (!product) return await reply.code(404).send({ message: "Product not found" })

    return {
      id: product.id,
      name: product.name,
      description: product.description,
    }
  }

  delete = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> => {
    const id = Number(request.params.id)
    if (!(await getProductUseCase.execute(id))) {
      return await reply.code(404).send({ message: "Product not found" })
    }
    if (!(await deleteProductUseCase.execute(id))) {
      return await reply.code(404).send({ message: "Product not found" })
    }
    return await reply.code(204).send()
  }
}

export const productHandler = new ProductHandler()
