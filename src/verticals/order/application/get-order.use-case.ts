import { type Order } from "../domain/order.entity"
import { orderRepository } from "../infrastructure/persistence/order.repository"

export class GetOrderUseCase {
  async execute(id: number): Promise<Order | null> {
    return await orderRepository.findById(id)
  }
}

export const getOrderUseCase = new GetOrderUseCase()
