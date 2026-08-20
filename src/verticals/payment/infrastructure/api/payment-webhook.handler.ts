import { type FastifyReply, type FastifyRequest } from "fastify"
import { updateOrderPaymentDispatcher } from "../../../order/infrastructure/dispatchers/update-order-payment.dispatcher"
import { stripeAdapter } from "../stripe.adapter"

class PaymentWebhookHandler {
  handle = async (
    request: FastifyRequest<{ Body: Buffer }>,
    reply: FastifyReply,
  ): Promise<FastifyReply> => {
    const signature = request.headers["stripe-signature"]
    if (typeof signature !== "string") {
      return await reply.code(400).send({ error: "Stripe signature is required" })
    }
    try {
      const update = stripeAdapter.parseWebhook(request.body, signature)
      if (update) {
        await updateOrderPaymentDispatcher.updateStatus(update.orderId, update.status)
      }
      return await reply.code(200).send({ received: true })
    } catch (error) {
      request.log.warn(error, "Rejected Stripe webhook")
      return await reply.code(400).send({ error: "Invalid Stripe webhook" })
    }
  }
}

export const paymentWebhookHandler = new PaymentWebhookHandler()
