import { type FastifyPluginAsync } from "fastify"
import { paymentHandler } from "./payment-http.handler"

const router: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{
    Body: { items: Array<{ variantId: number; quantity: number }> }
  }>(
    "/create-checkout-session",
    {
      schema: {
        body: {
          type: "object",
          required: ["items"],
          additionalProperties: false,
          properties: {
            items: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["variantId", "quantity"],
                additionalProperties: false,
                properties: {
                  variantId: { type: "integer", minimum: 1 },
                  quantity: { type: "integer", minimum: 1 },
                },
              },
            },
          },
        },
      },
    },
    paymentHandler.createCheckoutSession,
  )

  fastify.get<{ Querystring: { session_id: string } }>(
    "/session-status",
    {
      schema: {
        querystring: {
          type: "object",
          required: ["session_id"],
          additionalProperties: false,
          properties: { session_id: { type: "string", minLength: 1 } },
        },
      },
    },
    paymentHandler.getCheckoutSession,
  )
}

export default router
