import { type FastifyPluginAsync } from "fastify"
import { paymentWebhookHandler } from "./payment-webhook.handler"

const router: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.removeContentTypeParser("application/json")
  fastify.addContentTypeParser("application/json", { parseAs: "buffer" }, (_request, body, done) =>
    done(null, body),
  )

  fastify.post<{ Body: Buffer }>("/stripe/webhook", paymentWebhookHandler.handle)
}

export default router
