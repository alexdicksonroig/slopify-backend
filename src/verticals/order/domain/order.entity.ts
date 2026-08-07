export type OrderItem = {
  productId: number
  quantity: number
  unitPriceInCents: number
}

export class InvalidOrderError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidOrderError"
  }
}

export class Order {
  readonly items: readonly OrderItem[]

  constructor(
    readonly id: number | null,
    readonly invoicePriceInCents: number,
    readonly shippingPriceInCents: number,
    readonly totalPriceInCents: number,
    items: OrderItem[],
    readonly createdAt: Date | null,
  ) {
    if (items.length === 0) throw new InvalidOrderError("An order must contain at least one item")

    for (const item of items) {
      if (!Number.isInteger(item.productId) || item.productId < 1) {
        throw new InvalidOrderError("Each item must reference a valid product")
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new InvalidOrderError("Each item quantity must be a positive integer")
      }
      if (!Number.isInteger(item.unitPriceInCents) || item.unitPriceInCents < 0) {
        throw new InvalidOrderError("Each item price must be a non-negative integer")
      }
    }

    const productIds = new Set(items.map((item) => item.productId))
    if (productIds.size !== items.length) {
      throw new InvalidOrderError("An order cannot contain duplicate products")
    }

    const calculatedInvoicePriceInCents = items.reduce(
      (price, item) => price + item.unitPriceInCents * item.quantity,
      0,
    )
    if (calculatedInvoicePriceInCents !== this.invoicePriceInCents) {
      throw new InvalidOrderError("Invoice price does not match the order items")
    }
    if (this.totalPriceInCents !== this.invoicePriceInCents + this.shippingPriceInCents) {
      throw new InvalidOrderError("Total price must equal invoice price plus shipping price")
    }
    if (
      !Number.isSafeInteger(this.invoicePriceInCents) ||
      !Number.isSafeInteger(this.shippingPriceInCents) ||
      !Number.isSafeInteger(this.totalPriceInCents) ||
      this.invoicePriceInCents < 0 ||
      this.shippingPriceInCents < 0 ||
      this.totalPriceInCents < 0
    ) {
      throw new InvalidOrderError("Order prices must be non-negative integers")
    }

    this.items = items.map((item) => ({ ...item }))
  }
}
