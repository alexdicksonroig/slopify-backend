import { type FastifyPluginAsync } from "fastify"
import { orderHandler } from "./order-http.handler"

const router: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{
    Body: {
      invoicePriceInCents: number
      shippingPriceInCents: number
      totalPriceInCents: number
      items: Array<{
        productId: number
        quantity: number
        unitPriceInCents: number
      }>
    }
  }>(
    "/orders",
    {
      schema: {
        body: {
          type: "object",
          required: ["invoicePriceInCents", "shippingPriceInCents", "totalPriceInCents", "items"],
          additionalProperties: false,
          properties: {
            invoicePriceInCents: { type: "integer", minimum: 0 },
            shippingPriceInCents: { type: "integer", minimum: 0 },
            totalPriceInCents: { type: "integer", minimum: 0 },
            items: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["productId", "quantity", "unitPriceInCents"],
                additionalProperties: false,
                properties: {
                  productId: { type: "integer", minimum: 1 },
                  quantity: { type: "integer", minimum: 1 },
                  unitPriceInCents: { type: "integer", minimum: 0 },
                },
              },
            },
          },
        },
      },
    },
    orderHandler.create,
  )
}

export default router
