import { type FastifyPluginAsync } from "fastify"
import { variantHandler } from "./variant-http.handler"

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
    Body: { unitAmount: number; currency: string }
  }>(
    "/products/:productId/variants",
    {
      schema: {
        params: productIdParams,
        body: {
          type: "object",
          required: ["unitAmount", "currency"],
          additionalProperties: false,
          properties: {
            unitAmount: { type: "integer", minimum: 1 },
            currency: { type: "string", pattern: "^[A-Za-z]{3}$" },
          },
        },
      },
    },
    variantHandler.create,
  )

  fastify.delete<{ Params: { variantId: string } }>(
    "/product-variants/:variantId",
    { schema: { params: variantIdParams } },
    variantHandler.delete,
  )

  fastify.post<{
    Params: { variantId: string }
    Body: { optionId: number; valueId: number }
  }>(
    "/product-variants/:variantId/selections",
    {
      schema: {
        params: variantIdParams,
        body: {
          type: "object",
          required: ["optionId", "valueId"],
          additionalProperties: false,
          properties: {
            optionId: { type: "integer", minimum: 1 },
            valueId: { type: "integer", minimum: 1 },
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
