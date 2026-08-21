import { getDrizzleDB } from "@database"
import { desc, eq } from "drizzle-orm"
import { Order, type OrderStatus } from "../../domain/order.entity"
import { orderItems, orders } from "./schema"

export class OrderRepository {
  async create(order: Order): Promise<Order> {
    return await getDrizzleDB().transaction(async (transaction) => {
      const [record] = await transaction
        .insert(orders)
        .values({
          checkoutSessionId: order.checkoutSessionId,
          status: order.status,
        })
        .returning({ id: orders.id, createdAt: orders.createdAt })

      await transaction.insert(orderItems).values(
        order.items.map((item) => ({
          orderId: record.id,
          variantId: item.variantId,
          quantity: item.quantity,
          productName: item.productName,
          unitAmount: item.unitAmount,
          currency: item.currency,
        })),
      )

      return new Order(
        record.id,
        [...order.items],
        order.checkoutSessionId,
        order.status,
        record.createdAt,
      )
    })
  }

  async findAll(): Promise<Order[]> {
    const database = getDrizzleDB()
    const orderRecords = await database.select().from(orders).orderBy(desc(orders.createdAt))
    const itemRecords = await database.select().from(orderItems)

    return orderRecords.map(
      (record) =>
        new Order(
          record.id,
          itemRecords
            .filter((item) => item.orderId === record.id)
            .map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              productName: item.productName,
              unitAmount: item.unitAmount,
              currency: item.currency,
            })),
          record.checkoutSessionId,
          record.status as OrderStatus,
          record.createdAt,
        ),
    )
  }

  async findById(id: number): Promise<Order | null> {
    const [record] = await getDrizzleDB().select().from(orders).where(eq(orders.id, id)).limit(1)
    if (!record) return null

    const items = await getDrizzleDB().select().from(orderItems).where(eq(orderItems.orderId, id))
    return new Order(
      record.id,
      items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        productName: item.productName,
        unitAmount: item.unitAmount,
        currency: item.currency,
      })),
      record.checkoutSessionId,
      record.status as OrderStatus,
      record.createdAt,
    )
  }

  async setCheckoutSessionId(orderId: number, checkoutSessionId: string): Promise<void> {
    await getDrizzleDB().update(orders).set({ checkoutSessionId }).where(eq(orders.id, orderId))
  }

  async setStatus(orderId: number, status: OrderStatus): Promise<void> {
    await getDrizzleDB().update(orders).set({ status }).where(eq(orders.id, orderId))
  }
}

export const orderRepository = new OrderRepository()
