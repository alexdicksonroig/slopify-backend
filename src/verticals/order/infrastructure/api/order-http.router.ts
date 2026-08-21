import { type FastifyPluginAsync } from "fastify"
import { orderHandler } from "./order-http.handler"

const router: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get("/orders", orderHandler.list)
  fastify.get<{ Params: { id: string } }>(
    "/orders/:id",
    {
      schema: {
        params: {
          type: "object",
          required: ["id"],
          additionalProperties: false,
          properties: { id: { type: "string", pattern: "^[1-9][0-9]*$" } },
        },
      },
    },
    orderHandler.get,
  )
}

export default router
