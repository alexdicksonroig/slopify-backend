import { type Order } from "../domain/order.entity"
import { orderRepository } from "../infrastructure/persistence/order.repository"

export class ListOrdersUseCase {
  async execute(): Promise<Order[]> {
    return await orderRepository.findAll()
  }
}

export const listOrdersUseCase = new ListOrdersUseCase()
