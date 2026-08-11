import { Order, type OrderItem } from "../domain/order.entity"
import { orderRepository } from "../infrastructure/persistence/order.repository"

export class CreateOrderUseCase {
  async execute(input: {
    couponCode?: string
    address: string
    items: OrderItem[]
  }): Promise<Order> {
    const order = new Order(null, input.couponCode ?? null, input.address, input.items, null)

    return await orderRepository.create(order)
  }
}

export const createOrderUseCase = new CreateOrderUseCase()
