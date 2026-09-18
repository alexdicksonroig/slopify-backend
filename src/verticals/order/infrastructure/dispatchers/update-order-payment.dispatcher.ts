import { getDrizzleDB } from "@database"
import { adjustVariantStockDispatcher } from "../../../product/infrastructure/dispatchers/adjust-variant-stock.dispatcher"
import { type OrderStatus } from "../../domain/order.entity"
import { orderRepository } from "../persistence/order.repository"

export const updateOrderPaymentDispatcher = {
  attachCheckoutSession: async (orderId: number, checkoutSessionId: string): Promise<void> => {
    await orderRepository.setCheckoutSessionId(orderId, checkoutSessionId)
  },

  updateStatus: async (orderId: number, status: OrderStatus): Promise<void> => {
    if (status === "paid") {
      await getDrizzleDB().transaction(async (transaction) => {
        const order = await orderRepository.findById(orderId, transaction)
        if (!order) return

        const transitioned = await orderRepository.transitionStatus(
          orderId,
          "pending",
          "paid",
          transaction,
        )
        if (!transitioned) return

        for (const item of order.items) {
          await adjustVariantStockDispatcher.decrement(item.variantId, item.quantity, transaction)
        }
      })
      return
    }

    await orderRepository.setStatus(orderId, status)
  },
}
