export type OrderItem = {
  variantId: number
  quantity: number
}

export class Order {
  readonly items: readonly OrderItem[]

  constructor(
    readonly id: number | null,
    readonly couponCode: string | null,
    readonly address: string,
    items: OrderItem[],
    readonly createdAt: Date | null,
  ) {
    this.items = items.map((item) => ({ ...item }))
  }
}
