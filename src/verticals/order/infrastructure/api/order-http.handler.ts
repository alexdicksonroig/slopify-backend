import { type FastifyReply, type FastifyRequest } from "fastify"
import { createOrderUseCase } from "../../application/create-order.use-case"

class OrderHandler {
  create = async (
    request: FastifyRequest<{
      Body: {
        couponCode?: string
        address: string
        items: Array<{
          variantId: number
          quantity: number
        }>
      }
    }>,
    reply: FastifyReply,
  ) => {
    const order = await createOrderUseCase.execute(request.body)
    return await reply.code(201).send(order)
  }
}

export const orderHandler = new OrderHandler()
