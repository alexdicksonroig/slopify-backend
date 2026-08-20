export type OrderStatus = "pending" | "paid" | "payment_failed" | "expired"

export type OrderItem = {
  variantId: number
  quantity: number
  productName: string
  unitAmount: number
  currency: string
}

export class Order {
  readonly items: readonly OrderItem[]

  constructor(
    readonly id: number | null,
    items: OrderItem[],
    readonly checkoutSessionId: string | null,
    readonly status: OrderStatus,
    readonly createdAt: Date | null,
  ) {
    this.items = items.map((item) => ({ ...item }))
  }
}
