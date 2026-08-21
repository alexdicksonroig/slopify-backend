import { type ProductOption } from "../options/product-option.entity"
import { type ProductOptionValue } from "../options/product-option-value.entity"
import { type Product } from "../product.entity"

export type ProductOptionSelection = {
  option: ProductOption
  value: ProductOptionValue
}

export class Variant {
  thumbnail: string | null

  constructor(
    readonly id: number,
    readonly productId: number,
    readonly unitAmount: number | null,
    readonly currency: string | null,
    readonly selections: ProductOptionSelection[],
    thumbnailReference: string | null,
  ) {
    this.thumbnail = thumbnailReference
  }

  replaceThumbnail(reference: string): void {
    this.thumbnail = reference
  }

  removeThumbnail(): void {
    this.thumbnail = null
  }
}

export type VariantInList = {
  id: number
  unitAmount: number | null
  currency: string | null
  thumbnail: string | null
  product: Product
}

export class VariantWithProduct extends Variant {
  constructor(
    id: number,
    productId: number,
    unitAmount: number | null,
    currency: string | null,
    selections: ProductOptionSelection[],
    thumbnailReference: string | null,
    readonly product: Product,
  ) {
    super(id, productId, unitAmount, currency, selections, thumbnailReference)
  }
}
