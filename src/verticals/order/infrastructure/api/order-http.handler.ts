import { type FastifyReply, type FastifyRequest } from "fastify"
import { createOrderUseCase } from "../../application/create-order.use-case"
import { InvalidOrderError } from "../../domain/order.entity"

class OrderHandler {
  create = async (
    request: FastifyRequest<{
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
    }>,
    reply: FastifyReply,
  ) => {
    try {
      const order = await createOrderUseCase.execute(request.body)
      return await reply.code(201).send(order)
    } catch (error) {
      if (error instanceof InvalidOrderError) {
        return await reply.code(400).send({ message: error.message })
      }
      throw error
    }
  }
}

export const orderHandler = new OrderHandler()
