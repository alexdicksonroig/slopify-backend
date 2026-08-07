import { Order, type OrderItem } from "../domain/order.entity"
import { orderRepository } from "../infrastructure/persistence/order.repository"

export class CreateOrderUseCase {
  async execute(input: {
    invoicePriceInCents: number
    shippingPriceInCents: number
    totalPriceInCents: number
    items: OrderItem[]
  }): Promise<Order> {
    const order = new Order(
      null,
      input.invoicePriceInCents,
      input.shippingPriceInCents,
      input.totalPriceInCents,
      input.items,
      null,
    )

    return await orderRepository.create(order)
  }
}

export const createOrderUseCase = new CreateOrderUseCase()
