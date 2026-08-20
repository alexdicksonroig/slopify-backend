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
    readonly unitAmount: number | null,
    readonly currency: string | null,
    readonly selections: ProductOptionSelection[],
  ) {}
}
