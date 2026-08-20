import { type OrderStatus } from "../../domain/order.entity"
import { orderRepository } from "../persistence/order.repository"

export const updateOrderPaymentDispatcher = {
  attachCheckoutSession: async (orderId: number, checkoutSessionId: string): Promise<void> => {
    await orderRepository.setCheckoutSessionId(orderId, checkoutSessionId)
  },

  updateStatus: async (orderId: number, status: OrderStatus): Promise<void> => {
    await orderRepository.setStatus(orderId, status)
  },
}
