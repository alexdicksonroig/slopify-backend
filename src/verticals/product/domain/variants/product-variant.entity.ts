import { type ProductOption } from "../options/product-option.entity"

export type ProductOptionSelection = {
  option: ProductOption
  value: string
}

export class ProductVariant {
  constructor(
    readonly id: number,
    readonly productId: number,
    readonly sku: string,
    readonly selections: ProductOptionSelection[],
  ) {}
}
