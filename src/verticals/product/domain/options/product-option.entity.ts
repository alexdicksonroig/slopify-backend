import { type LocalizedText } from "../localized-text"
import { type ProductOptionValue } from "./product-option-value.entity"

export class ProductOption {
  constructor(
    readonly id: number,
    readonly optionId: string,
    readonly possibleValues: ProductOptionValue[],
    readonly label: LocalizedText,
  ) {}
}
