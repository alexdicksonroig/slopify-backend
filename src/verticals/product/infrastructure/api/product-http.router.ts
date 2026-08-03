import multipart from '@fastify/multipart'
import { type FastifyPluginAsync } from 'fastify'
import { productHandler } from './product-http.handler'
import { productThumbnailHandler } from './product-thumbnail-http.handler'
import {
  type CreateProductBody,
  type GetProductParams,
  type UpdateProductBody
} from './product-http.dtos'

const productIdParams = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', pattern: '^[1-9][0-9]*$' }
  }
}

const productBodyProperties = {
  name: { type: 'string', minLength: 1 },
  description: { type: ['string', 'null'] },
  priceInCents: { type: 'integer', minimum: 0 }
}

const router: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(multipart, {
    limits: { fileSize: 500_000, files: 1, parts: 1 }
  })

  fastify.get('/products', productHandler.list)

  fastify.get<{ Params: GetProductParams }>('/products/:id', {
    schema: { params: productIdParams }
  }, productHandler.get)

  // TODO: Require admin authentication for all Product mutation routes.
  fastify.post<{ Body: CreateProductBody }>('/products', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'priceInCents'],
        additionalProperties: false,
        properties: productBodyProperties
      }
    }
  }, productHandler.create)

  fastify.patch<{ Params: GetProductParams, Body: UpdateProductBody }>('/products/:id', {
    schema: {
      params: productIdParams,
      body: {
        type: 'object',
        minProperties: 1,
        additionalProperties: false,
        properties: productBodyProperties
      }
    }
  }, productHandler.update)

  fastify.put<{ Params: GetProductParams }>('/products/:id/thumbnail', {
    schema: { params: productIdParams }
  }, productThumbnailHandler.upload)

  fastify.delete<{ Params: GetProductParams }>('/products/:id/thumbnail', {
    schema: { params: productIdParams }
  }, productThumbnailHandler.remove)

  fastify.delete<{ Params: GetProductParams }>('/products/:id', {
    schema: { params: productIdParams }
  }, productHandler.delete)
}

export default router
