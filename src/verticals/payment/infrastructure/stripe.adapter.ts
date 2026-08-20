import Stripe from "stripe"

const secretKey = process.env.STRIPE_SECRET_KEY?.trim()
if (!secretKey) throw new Error("STRIPE_SECRET_KEY is required")

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173"
const stripe = new Stripe(secretKey)

export const stripeAdapter = {
  createCheckoutSession: async (
    orderId: number,
    items: ReadonlyArray<{
      variantId: number
      quantity: number
      productName: string
      unitAmount: number
      currency: string
    }>,
  ): Promise<{ id: string; clientSecret: string }> => {
    const session = await stripe.checkout.sessions.create({
      ui_mode: "elements",
      mode: "payment",
      line_items: items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: item.currency,
          unit_amount: item.unitAmount,
          product_data: {
            name: item.productName,
            metadata: { variantId: String(item.variantId) },
          },
        },
      })),
      metadata: { orderId: String(orderId) },
      return_url: `${corsOrigin}/return?session_id={CHECKOUT_SESSION_ID}`,
    })
    if (!session.client_secret) throw new Error("Stripe did not return a client secret")
    return { id: session.id, clientSecret: session.client_secret }
  },

  getCheckoutSession: async (sessionId: string) => {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return { status: session.status, paymentStatus: session.payment_status }
  },

  parseWebhook: (
    payload: Buffer,
    signature: string,
  ): {
    orderId: number
    status: "paid" | "payment_failed" | "expired"
  } | null => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is required")

    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    if (!event.type.startsWith("checkout.session.")) return null

    const session = event.data.object as Stripe.Checkout.Session
    const orderId = Number(session.metadata?.orderId)
    if (!Number.isInteger(orderId) || orderId < 1) throw new Error("Stripe session has no order ID")

    if (
      event.type === "checkout.session.async_payment_succeeded" ||
      (event.type === "checkout.session.completed" && session.payment_status === "paid")
    ) {
      return { orderId, status: "paid" }
    }
    if (event.type === "checkout.session.async_payment_failed") {
      return { orderId, status: "payment_failed" }
    }
    if (event.type === "checkout.session.expired") return { orderId, status: "expired" }

    return null
  },
}
