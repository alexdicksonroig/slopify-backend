import { type ProductOption } from "../options/product-option.entity"
import { type ProductOptionValue } from "../options/product-option-value.entity"

export type ProductOptionSelection = {
  option: ProductOption
  value: ProductOptionValue
}

export class ProductVariant {
  constructor(
    readonly id: number,
    readonly productId: number,
    readonly sku: string,
    readonly unitAmount: number,
    readonly currency: string,
    readonly selections: ProductOptionSelection[],
  ) {}
}
