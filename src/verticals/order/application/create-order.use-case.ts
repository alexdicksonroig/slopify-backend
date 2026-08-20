import { Order, type OrderItem } from "../domain/order.entity"

export class CreateOrderUseCase {
  execute(items: OrderItem[]): Order {
    return new Order(null, items, null, "pending", null)
  }
}

export const createOrderUseCase = new CreateOrderUseCase()
