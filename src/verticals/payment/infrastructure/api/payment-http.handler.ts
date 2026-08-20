import { type FastifyReply, type FastifyRequest } from "fastify"
import { createOrderDispatcher } from "../../../order/infrastructure/dispatchers/create-order.dispatcher"
import { updateOrderPaymentDispatcher } from "../../../order/infrastructure/dispatchers/update-order-payment.dispatcher"
import { getCheckoutItemsDispatcher } from "../../../product/infrastructure/dispatchers/get-checkout-items.dispatcher"
import { stripeAdapter } from "../stripe.adapter"

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Stripe request failed"

class PaymentHandler {
  createCheckoutSession = async (
    request: FastifyRequest<{
      Body: { items: Array<{ variantId: number; quantity: number }> }
    }>,
    reply: FastifyReply,
  ) => {
    try {
      const items = await getCheckoutItemsDispatcher.execute(request.body.items)
      const order = await createOrderDispatcher.persist(createOrderDispatcher.execute(items))
      if (!order.id) throw new Error("Order was not persisted")

      const session = await stripeAdapter.createCheckoutSession(order.id, order.items)
      await updateOrderPaymentDispatcher.attachCheckoutSession(order.id, session.id)

      return await reply.type("application/json").send(JSON.stringify(session.clientSecret))
    } catch (error) {
      return await reply.code(400).send({ error: errorMessage(error) })
    }
  }

  getCheckoutSession = async (
    request: FastifyRequest<{ Querystring: { session_id: string } }>,
    reply: FastifyReply,
  ) => {
    const session = await stripeAdapter.getCheckoutSession(request.query.session_id)
    return await reply.send({
      status: session.status,
      payment_status: session.paymentStatus,
    })
  }
}

export const paymentHandler = new PaymentHandler()
