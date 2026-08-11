import { type FastifyPluginAsync } from "fastify"
import { orderHandler } from "./order-http.handler"

const router: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{
    Body: {
      couponCode?: string
      address: string
      items: Array<{
        variantId: number
        quantity: number
      }>
    }
  }>(
    "/orders",
    {
      schema: {
        body: {
          type: "object",
          required: ["address", "items"],
          additionalProperties: false,
          properties: {
            couponCode: { type: "string" },
            address: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                required: ["variantId", "quantity"],
                additionalProperties: false,
                properties: {
                  variantId: { type: "integer" },
                  quantity: { type: "integer", minimum: 1 },
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
