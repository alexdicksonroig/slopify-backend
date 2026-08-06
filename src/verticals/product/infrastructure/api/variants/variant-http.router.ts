import { type FastifyPluginAsync } from "fastify"
import { variantHandler } from "./variant-http.handler"

const nonBlankString = {
  type: "string",
  minLength: 1,
  pattern: ".*\\S.*",
}

const positiveId = { type: "string", pattern: "^[1-9][0-9]*$" }

const productIdParams = {
  type: "object",
  required: ["productId"],
  additionalProperties: false,
  properties: { productId: positiveId },
}

const variantIdParams = {
  type: "object",
  required: ["variantId"],
  additionalProperties: false,
  properties: { variantId: positiveId },
}

const selectionParams = {
  type: "object",
  required: ["variantId", "optionId"],
  additionalProperties: false,
  properties: {
    variantId: positiveId,
    optionId: positiveId,
  },
}

const router: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get<{
    Params: { productId: string }
  }>(
    "/products/:productId/variants",
    {
      schema: { params: productIdParams },
    },
    variantHandler.listForProduct,
  )

  fastify.post<{
    Params: { productId: string }
    Body: { sku: string }
  }>(
    "/products/:productId/variants",
    {
      schema: {
        params: productIdParams,
        body: {
          type: "object",
          required: ["sku"],
          additionalProperties: false,
          properties: { sku: nonBlankString },
        },
      },
    },
    variantHandler.create,
  )

  fastify.post<{
    Params: { variantId: string }
    Body: { optionId: number; value: string }
  }>(
    "/product-variants/:variantId/selections",
    {
      schema: {
        params: variantIdParams,
        body: {
          type: "object",
          required: ["optionId", "value"],
          additionalProperties: false,
          properties: {
            optionId: { type: "integer", minimum: 1 },
            value: nonBlankString,
          },
        },
      },
    },
    variantHandler.addSelection,
  )

  fastify.delete<{
    Params: { variantId: string; optionId: string }
  }>(
    "/product-variants/:variantId/selections/:optionId",
    { schema: { params: selectionParams } },
    variantHandler.deleteSelection,
  )
}

export default router
