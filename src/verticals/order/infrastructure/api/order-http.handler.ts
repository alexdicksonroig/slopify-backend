import { type FastifyReply, type FastifyRequest } from "fastify"
import { getOrderUseCase } from "../../application/get-order.use-case"
import { listOrdersUseCase } from "../../application/list-orders.use-case"

class OrderHandler {
  list = async () => await listOrdersUseCase.execute()

  get = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const order = await getOrderUseCase.execute(Number(request.params.id))
    if (!order) return await reply.code(404).send({ message: "Order not found" })
    return order
  }
}

export const orderHandler = new OrderHandler()
