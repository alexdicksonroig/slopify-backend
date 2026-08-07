import { getDrizzleDB } from "@database"
import { Order } from "../../domain/order.entity"
import { orderItems, orders } from "./schema"

export class OrderRepository {
  async create(order: Order): Promise<Order> {
    return await getDrizzleDB().transaction(async (transaction) => {
      const [record] = await transaction
        .insert(orders)
        .values({
          invoicePriceInCents: order.invoicePriceInCents,
          shippingPriceInCents: order.shippingPriceInCents,
          totalPriceInCents: order.totalPriceInCents,
        })
        .returning({ id: orders.id, createdAt: orders.createdAt })

      await transaction.insert(orderItems).values(
        order.items.map((item) => ({
          orderId: record.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPriceInCents: item.unitPriceInCents,
        })),
      )

      return new Order(
        record.id,
        order.invoicePriceInCents,
        order.shippingPriceInCents,
        order.totalPriceInCents,
        [...order.items],
        record.createdAt,
      )
    })
  }
}

export const orderRepository = new OrderRepository()
