import multipart from "@fastify/multipart"
import { type FastifyPluginAsync } from "fastify"
import { type ProductSort } from "../../domain/product.repository"
import { productHandler } from "./product-http.handler"
import { productThumbnailHandler } from "./product-thumbnail-http.handler"

const productIdParams = {
  type: "object",
  required: ["id"],
  additionalProperties: false,
  properties: {
    id: { type: "string", pattern: "^[1-9][0-9]*$" },
  },
}

const productBodyProperties = {
  name: { type: "string", minLength: 1 },
  description: { type: ["string", "null"] },
}

const router: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(multipart, {
    limits: { fileSize: 500_000, files: 1, parts: 1 },
  })

  fastify.get<{
    Querystring: Record<string, string> & { sort?: ProductSort }
  }>(
    "/products",
    {
      schema: {
        querystring: {
          type: "object",
          propertyNames: {
            anyOf: [{ const: "sort" }, { type: "string", pattern: "^[1-9][0-9]*$" }],
          },
          properties: {
            sort: { type: "string", enum: ["newest", "price-asc", "price-desc"] },
          },
          additionalProperties: { type: "string", pattern: "^[1-9][0-9]*$" },
        },
      },
    },
    productHandler.list,
  )

  fastify.get<{ Params: { id: string } }>(
    "/products/:id",
    {
      schema: { params: productIdParams },
    },
    productHandler.get,
  )

  // TODO: Require admin authentication for all Product mutation routes.
  fastify.post<{
    Body: {
      name: string
      description?: string | null
    }
  }>(
    "/products",
    {
      schema: {
        body: {
          type: "object",
          required: ["name"],
          additionalProperties: false,
          properties: productBodyProperties,
        },
      },
    },
    productHandler.create,
  )

  fastify.patch<{
    Params: { id: string }
    Body: Partial<{
      name: string
      description?: string | null
    }>
  }>(
    "/products/:id",
    {
      schema: {
        params: productIdParams,
        body: {
          type: "object",
          minProperties: 1,
          additionalProperties: false,
          properties: productBodyProperties,
        },
      },
    },
    productHandler.update,
  )

  fastify.put<{ Params: { id: string } }>(
    "/products/:id/thumbnail",
    {
      schema: { params: productIdParams },
    },
    productThumbnailHandler.upload,
  )

  fastify.delete<{ Params: { id: string } }>(
    "/products/:id/thumbnail",
    {
      schema: { params: productIdParams },
    },
    productThumbnailHandler.remove,
  )

  fastify.delete<{ Params: { id: string } }>(
    "/products/:id",
    {
      schema: { params: productIdParams },
    },
    productHandler.delete,
  )
}

export default router
