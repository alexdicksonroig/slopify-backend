import { type ProductOption } from "../options/product-option.entity"
import { type ProductOptionValue } from "../options/product-option-value.entity"
import { type Product } from "../product.entity"

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

export type VariantInList = {
  id: number
  unitAmount: number | null
  currency: string | null
  product: Product
}

export class ProductVariantWithProduct extends ProductVariant {
  constructor(
    id: number,
    productId: number,
    unitAmount: number | null,
    currency: string | null,
    selections: ProductOptionSelection[],
    readonly product: Product,
  ) {
    super(id, productId, unitAmount, currency, selections)
  }
}
