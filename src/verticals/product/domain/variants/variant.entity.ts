import { type ProductOption } from "../options/product-option.entity"
import { type ProductOptionValue } from "../options/product-option-value.entity"

export type ProductOptionSelection = {
  option: ProductOption
  value: ProductOptionValue
}

export class Variant {
  stock: number
  thumbnail: string | null
  cover: string | null

  constructor(
    readonly id: number,
    readonly productId: number,
    readonly unitAmount: number | null,
    readonly currency: string | null,
    stock: number,
    readonly selections: ProductOptionSelection[],
    thumbnailReference: string | null,
    coverReference: string | null,
  ) {
    this.setStock(stock)
    this.thumbnail = thumbnailReference
    this.cover = coverReference
  }

  setStock(stock: number): void {
    if (!Number.isInteger(stock) || stock < 0)
      throw new Error("Stock must be a non-negative integer")
    this.stock = stock
  }

  replaceThumbnail(reference: string): void {
    this.thumbnail = reference
  }

  removeThumbnail(): void {
    this.thumbnail = null
  }

  replaceCover(reference: string): void {
    this.cover = reference
  }

  removeCover(): void {
    this.cover = null
  }
}
