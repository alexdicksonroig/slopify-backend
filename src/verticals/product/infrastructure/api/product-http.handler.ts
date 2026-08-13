import { type FastifyReply, type FastifyRequest } from "fastify"
import { createProductUseCase } from "../../application/create-product.use-case"
import { deleteProductUseCase } from "../../application/delete-product.use-case"
import { getProductUseCase } from "../../application/get-product.use-case"
import { listProductsUseCase } from "../../application/list-products.use-case"
import { updateProductUseCase } from "../../application/update-product.use-case"
import { type ProductSort } from "../../domain/product.repository"
import { r2Adapter } from "../r2.adapter"

class ProductHandler {
  list = async (
    request: FastifyRequest<{
      Querystring: Record<string, string | undefined> & { sort?: ProductSort }
    }>,
  ) => {
    const { sort, ...filters } = request.query
    const products = await listProductsUseCase.execute(
      Object.entries(filters).map(([option, value]) => ({ option, value: value! })),
      sort,
    )
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      priceInCents: product.priceInCents,
      thumbnailUrl: product.thumbnail ? r2Adapter.publicUrl(product.thumbnail) : null,
    }))
  }

  get = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const product = await getProductUseCase.execute(Number(request.params.id))
    if (!product) return await reply.code(404).send({ message: "Product not found" })

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      priceInCents: product.priceInCents,
      thumbnailUrl: product.thumbnail ? r2Adapter.publicUrl(product.thumbnail) : null,
    }
  }

  create = async (
    request: FastifyRequest<{
      Body: {
        name: string
        description?: string | null
        priceInCents: number
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
      priceInCents: product.priceInCents,
      thumbnailUrl: null,
    })
  }

  update = async (
    request: FastifyRequest<{
      Params: { id: string }
      Body: Partial<{
        name: string
        description?: string | null
        priceInCents: number
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
      priceInCents: product.priceInCents,
      thumbnailUrl: product.thumbnail ? r2Adapter.publicUrl(product.thumbnail) : null,
    }
  }

  delete = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> => {
    const id = Number(request.params.id)
    const product = await getProductUseCase.execute(id)
    if (!product) return await reply.code(404).send({ message: "Product not found" })
    if (!(await deleteProductUseCase.execute(id))) {
      return await reply.code(404).send({ message: "Product not found" })
    }
    if (!product.thumbnail) return await reply.code(204).send()

    try {
      await r2Adapter.delete(product.thumbnail)
    } catch (error) {
      request.log.error({ error, productId: id }, "Could not clean up Product Thumbnail")
    }
    return await reply.code(204).send()
  }
}

export const productHandler = new ProductHandler()
