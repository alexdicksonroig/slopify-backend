import { type FastifyPluginAsync } from "fastify"
import { type LocalizedText } from "../../domain/localized-text"
import { productHandler } from "./product-http.handler"

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
  description: {
    anyOf: [
      {
        type: "object",
        minProperties: 1,
        additionalProperties: { type: "string" },
      },
      { type: "null" },
    ],
  },
}

const router: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get("/products", productHandler.list)

  fastify.get<{ Params: { id: string } }>(
    "/products/:id",
    {
      schema: { params: productIdParams },
    },
    productHandler.get,
  )

  fastify.post<{
    Body: {
      name: string
      description?: LocalizedText | null
    }
  }>(
    "/products",
    {
      onRequest: fastify.authenticate,
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
      description?: LocalizedText | null
    }>
  }>(
    "/products/:id",
    {
      onRequest: fastify.authenticate,
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

  fastify.delete<{ Params: { id: string } }>(
    "/products/:id",
    {
      onRequest: fastify.authenticate,
      schema: { params: productIdParams },
    },
    productHandler.delete,
  )
}

export default router
