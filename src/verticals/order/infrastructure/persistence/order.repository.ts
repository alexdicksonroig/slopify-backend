import { getDrizzleDB } from "@database"
import { Order } from "../../domain/order.entity"
import { orderItems, orders } from "./schema"

export class OrderRepository {
  async create(order: Order): Promise<Order> {
    return await getDrizzleDB().transaction(async (transaction) => {
      const [record] = await transaction
        .insert(orders)
        .values({
          couponCode: order.couponCode,
          address: order.address,
        })
        .returning({ id: orders.id, createdAt: orders.createdAt })

      await transaction.insert(orderItems).values(
        order.items.map((item) => ({
          orderId: record.id,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      )

      return new Order(
        record.id,
        order.couponCode,
        order.address,
        [...order.items],
        record.createdAt,
      )
    })
  }
}

export const orderRepository = new OrderRepository()
