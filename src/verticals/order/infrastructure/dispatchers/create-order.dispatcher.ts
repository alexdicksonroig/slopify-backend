import { createOrderUseCase } from "../../application/create-order.use-case"
import { type Order, type OrderItem } from "../../domain/order.entity"
import { orderRepository } from "../persistence/order.repository"

export const createOrderDispatcher = {
  execute: (items: OrderItem[]) => createOrderUseCase.execute(items),

  persist: async (order: Order): Promise<Order> => await orderRepository.create(order),
}
