import { type FastifyReply, type FastifyRequest } from 'fastify'
import { CreateProductUseCase } from '../../application/create-product.use-case'
import { DeleteProductUseCase } from '../../application/delete-product.use-case'
import { GetProductUseCase } from '../../application/get-product.use-case'
import { ListProductsUseCase } from '../../application/list-products.use-case'
import { UpdateProductUseCase } from '../../application/update-product.use-case'
import { productRepository } from '../persistence/product.repository'
import { r2Adapter } from '../r2.adapter'
import {
  type CreateProductBody,
  type GetProductParams,
  type ProductResponse,
  type UpdateProductBody
} from './product-http.dtos'

const productCreator = new CreateProductUseCase(productRepository)
const productDeleter = new DeleteProductUseCase(productRepository)
const productFinder = new GetProductUseCase(productRepository)
const productLister = new ListProductsUseCase(productRepository)
const productUpdater = new UpdateProductUseCase(productRepository)

class ProductHandler {
  list = async (): Promise<ProductResponse[]> => {
    const products = await productLister.execute()
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      priceInCents: product.priceInCents,
      thumbnailUrl: product.thumbnail
        ? r2Adapter.publicUrl(product.thumbnail)
        : null
    }))
  }

  get = async (
    request: FastifyRequest<{ Params: GetProductParams }>,
    reply: FastifyReply
  ): Promise<ProductResponse | FastifyReply> => {
    const product = await productFinder.execute(Number(request.params.id))
    if (!product) return await reply.code(404).send({ message: 'Product not found' })

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      priceInCents: product.priceInCents,
      thumbnailUrl: product.thumbnail
        ? r2Adapter.publicUrl(product.thumbnail)
        : null
    }
  }

  create = async (
    request: FastifyRequest<{ Body: CreateProductBody }>,
    reply: FastifyReply
  ): Promise<ProductResponse> => {
    const product = await productCreator.execute({
      ...request.body,
      description: request.body.description ?? null
    })
    return await reply.code(201).send({
      id: product.id,
      name: product.name,
      description: product.description,
      priceInCents: product.priceInCents,
      thumbnailUrl: null
    })
  }

  update = async (
    request: FastifyRequest<{ Params: GetProductParams, Body: UpdateProductBody }>,
    reply: FastifyReply
  ): Promise<ProductResponse | FastifyReply> => {
    const product = await productUpdater.execute(Number(request.params.id), request.body)
    if (!product) return await reply.code(404).send({ message: 'Product not found' })

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      priceInCents: product.priceInCents,
      thumbnailUrl: product.thumbnail
        ? r2Adapter.publicUrl(product.thumbnail)
        : null
    }
  }

  delete = async (
    request: FastifyRequest<{ Params: GetProductParams }>,
    reply: FastifyReply
  ): Promise<FastifyReply> => {
    const id = Number(request.params.id)
    const product = await productFinder.execute(id)
    if (!product) return await reply.code(404).send({ message: 'Product not found' })
    if (!await productDeleter.execute(id)) {
      return await reply.code(404).send({ message: 'Product not found' })
    }
    if (!product.thumbnail) return await reply.code(204).send()

    try {
      await r2Adapter.delete(product.thumbnail)
    } catch (error) {
      request.log.error({ error, productId: id }, 'Could not clean up Product Thumbnail')
    }
    return await reply.code(204).send()
  }
}

export const productHandler = new ProductHandler()
